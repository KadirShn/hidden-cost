import { describe, expect, it } from '@jest/globals';

import type { SyncQueueRecord } from '@/data/repositories/types';

import { buildCloudDocumentMutation, resolveCloudMutation } from './cloud-document';

const record = (overrides: Partial<SyncQueueRecord> = {}): SyncQueueRecord => ({
  id: 'queue-1',
  entityType: 'cost_item',
  entityId: 'item-1',
  operation: 'upsert',
  payloadJson: JSON.stringify({
    id: 'item-1',
    projectId: 'project-1',
    revision: 2,
    updatedAt: '2026-07-19T10:00:00.000Z',
    deviceId: 'device-a',
  }),
  attemptCount: 0,
  createdAt: '2026-07-19T10:00:00.000Z',
  ...overrides,
});

describe('cloud document mutations', () => {
  it('scopes cost items below the authenticated user and project', () => {
    const mutation = buildCloudDocumentMutation('user-a', record());

    expect(mutation.path).toBe('users/user-a/projects/project-1/costItems/item-1');
    expect(mutation.data.ownerId).toBe('user-a');
  });

  it('removes undefined values before sending a Firestore document', () => {
    const mutation = buildCloudDocumentMutation(
      'user-a',
      record({
        payloadJson: JSON.stringify({
          id: 'item-1',
          projectId: 'project-1',
          label: 'Fuel',
          optional: undefined,
          revision: 2,
          updatedAt: '2026-07-19T10:00:00.000Z',
          deviceId: 'device-a',
        }),
      }),
    );

    expect(mutation.data).not.toHaveProperty('optional');
  });

  it('keeps soft deletes as idempotent tombstones', () => {
    const mutation = buildCloudDocumentMutation(
      'user-a',
      record({
        operation: 'delete',
        payloadJson: JSON.stringify({
          id: 'item-1',
          projectId: 'project-1',
          deletedAt: '2026-07-19T11:00:00.000Z',
          revision: 3,
          deviceId: 'device-a',
        }),
      }),
    );

    expect(mutation.data).toMatchObject({
      deletedAt: '2026-07-19T11:00:00.000Z',
      revision: 3,
      ownerId: 'user-a',
    });
  });

  it('uses revision then updatedAt and exposes remote-newer conflicts', () => {
    const local = { revision: 3, updatedAt: '2026-07-19T10:00:00.000Z' };

    expect(resolveCloudMutation(local, { revision: 3, updatedAt: local.updatedAt })).toBe(
      'already_applied',
    );
    expect(resolveCloudMutation(local, { revision: 4, updatedAt: local.updatedAt })).toBe(
      'remote_newer',
    );
    expect(resolveCloudMutation(local, { revision: 2, updatedAt: local.updatedAt })).toBe('apply');
  });
});
