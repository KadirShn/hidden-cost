import { describe, expect, it, jest } from '@jest/globals';

import type {
  SyncQueueRecord,
  SyncQueueRepository,
  SyncQueueSummary,
} from '@/data/repositories/types';

import { calculateRetryAt, FirebaseSyncWorker } from './sync-worker';

import type { FirebaseClient } from './contracts';

const item: SyncQueueRecord = {
  id: 'queue-1',
  entityType: 'project',
  entityId: 'project-1',
  operation: 'upsert',
  payloadJson: '{}',
  attemptCount: 2,
  createdAt: '2026-07-19T10:00:00.000Z',
};

function queue(): SyncQueueRepository {
  return {
    listReady: jest.fn(() => [item]),
    getSummary: jest.fn<() => SyncQueueSummary>(() => ({ pending: 1, failed: 0, conflicts: 0 })),
    complete: jest.fn(),
    recordFailure: jest.fn(),
    recordConflict: jest.fn(),
  };
}

function queueWith(records: SyncQueueRecord[]): SyncQueueRepository {
  return {
    ...queue(),
    listReady: jest.fn(() => records),
  };
}

function client(result: 'applied' | 'remote_newer' = 'applied'): FirebaseClient {
  return {
    configured: true,
    currentUser: () => null,
    subscribeAuth: () => () => undefined,
    signInAnonymously: jest.fn(),
    linkGoogleAccount: jest.fn(),
    applyMutation: jest.fn(async () => result),
    initializeRemoteConfig: jest.fn(),
    deleteAccountAndCloudData: jest.fn(),
  } as FirebaseClient;
}

describe('FirebaseSyncWorker', () => {
  it('completes an idempotent cloud write', async () => {
    const repository = queue();
    const worker = new FirebaseSyncWorker(repository, client());

    await expect(worker.run('user-a')).resolves.toMatchObject({ completed: 1, failed: 0 });
    expect(repository.complete).toHaveBeenCalledWith(item);
  });

  it('does not overwrite a newer remote revision', async () => {
    const repository = queue();
    const worker = new FirebaseSyncWorker(repository, client('remote_newer'));

    await expect(worker.run('user-a')).resolves.toMatchObject({ conflicts: 1 });
    expect(repository.recordConflict).toHaveBeenCalledWith(item);
  });

  it('records bounded exponential retry after a transient failure', async () => {
    const repository = queue();
    const firebase = client();
    jest.mocked(firebase.applyMutation).mockRejectedValueOnce({ code: 'firestore/unavailable' });
    const worker = new FirebaseSyncWorker(
      repository,
      firebase,
      () => new Date('2026-07-19T10:00:00.000Z'),
      () => 1,
    );

    await worker.run('user-a');

    expect(repository.recordFailure).toHaveBeenCalledWith(
      item,
      'firestore/unavailable',
      '2026-07-19T10:00:04.000Z',
    );
    expect(calculateRetryAt(30, new Date(0), 1)).toBe('1970-01-01T00:15:00.000Z');
  });

  it('survives a batch-wide network outage and bounds work to 50 queue records', async () => {
    const records = Array.from({ length: 75 }, (_, index) => ({
      ...item,
      id: `queue-${index}`,
      entityId: `project-${index}`,
    }));
    const repository = queueWith(records);
    const firebase = client();
    jest.mocked(firebase.applyMutation).mockRejectedValue({ code: 'firestore/unavailable' });
    const worker = new FirebaseSyncWorker(
      repository,
      firebase,
      () => new Date(0),
      () => 0,
    );

    await expect(worker.run('user-a')).resolves.toEqual({
      processed: 50,
      completed: 0,
      failed: 50,
      conflicts: 0,
    });
    expect(repository.recordFailure).toHaveBeenCalledTimes(50);
  });

  it('coalesces concurrent foreground and network-recovery sync triggers', async () => {
    const repository = queue();
    const firebase = client();
    const worker = new FirebaseSyncWorker(repository, firebase);

    const first = worker.run('user-a');
    const second = worker.run('user-a');

    expect(second).toBe(first);
    await first;
    expect(firebase.applyMutation).toHaveBeenCalledTimes(1);
  });
});
