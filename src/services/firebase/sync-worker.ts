import type { SyncQueueRepository } from '@/data/repositories/types';

import type { FirebaseClient } from './contracts';

const BASE_RETRY_MS = 1_000;
const MAX_RETRY_MS = 15 * 60_000;

export function calculateRetryAt(
  attemptCount: number,
  now: Date,
  randomValue = Math.random(),
): string {
  const exponential = Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** attemptCount);
  const jittered = Math.round(exponential * (0.5 + Math.max(0, Math.min(1, randomValue)) * 0.5));
  return new Date(now.getTime() + jittered).toISOString();
}

function safeErrorCode(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error && typeof error.code === 'string') {
    return error.code.slice(0, 80);
  }
  return 'sync/unknown';
}

export type SyncRunResult = {
  processed: number;
  completed: number;
  failed: number;
  conflicts: number;
};

export class FirebaseSyncWorker {
  private running: Promise<SyncRunResult> | null = null;

  constructor(
    private readonly queue: SyncQueueRepository,
    private readonly firebase: FirebaseClient,
    private readonly now: () => Date = () => new Date(),
    private readonly random: () => number = Math.random,
  ) {}

  run(uid: string): Promise<SyncRunResult> {
    this.running ??= this.process(uid).finally(() => {
      this.running = null;
    });
    return this.running;
  }

  private async process(uid: string): Promise<SyncRunResult> {
    const result: SyncRunResult = { processed: 0, completed: 0, failed: 0, conflicts: 0 };
    for (const record of this.queue.listReady(this.now().toISOString()).slice(0, 50)) {
      result.processed += 1;
      try {
        const outcome = await this.firebase.applyMutation(uid, record);
        if (outcome === 'remote_newer') {
          this.queue.recordConflict(record);
          result.conflicts += 1;
        } else {
          this.queue.complete(record);
          result.completed += 1;
        }
      } catch (error) {
        this.queue.recordFailure(
          record,
          safeErrorCode(error),
          calculateRetryAt(record.attemptCount, this.now(), this.random()),
        );
        result.failed += 1;
      }
    }
    return result;
  }
}
