import { syncQueueTable } from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import type { RepositoryDependencies } from '@/data/repositories/dependencies';
import type { SyncQueueRecord } from '@/data/repositories/types';

export function enqueueSync<TRunResult>(
  db: AppDatabase<TRunResult>,
  dependencies: RepositoryDependencies,
  entityType: SyncQueueRecord['entityType'],
  entityId: string,
  operation: SyncQueueRecord['operation'],
  payload: unknown,
): void {
  const createdAt = dependencies.now();
  db.insert(syncQueueTable)
    .values({
      id: dependencies.createId(),
      entityType,
      entityId,
      operation,
      payloadJson: JSON.stringify(payload),
      attemptCount: 0,
      createdAt,
    })
    .onConflictDoUpdate({
      target: [syncQueueTable.entityType, syncQueueTable.entityId],
      set: {
        operation,
        payloadJson: JSON.stringify(payload),
        attemptCount: 0,
        nextAttemptAt: null,
        createdAt,
        lastError: null,
      },
    })
    .run();
}
