import { asc, eq, isNull, lte, or, sql } from 'drizzle-orm';

import { syncQueueTable } from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import type { SyncQueueRecord, SyncQueueRepository } from '@/data/repositories/types';

function fromRow(row: typeof syncQueueTable.$inferSelect): SyncQueueRecord {
  return {
    ...row,
    entityType: row.entityType as SyncQueueRecord['entityType'],
    operation: row.operation as SyncQueueRecord['operation'],
    nextAttemptAt: row.nextAttemptAt ?? undefined,
    lastError: row.lastError ?? undefined,
  };
}

export class SQLiteSyncQueueRepository<TRunResult> implements SyncQueueRepository {
  constructor(private readonly db: AppDatabase<TRunResult>) {}

  listReady(now = new Date().toISOString()): SyncQueueRecord[] {
    return this.db
      .select()
      .from(syncQueueTable)
      .where(or(isNull(syncQueueTable.nextAttemptAt), lte(syncQueueTable.nextAttemptAt, now)))
      .orderBy(asc(syncQueueTable.createdAt))
      .all()
      .map(fromRow);
  }

  recordFailure(id: string, errorCode: string, nextAttemptAt: string): void {
    this.db
      .update(syncQueueTable)
      .set({
        attemptCount: sql`${syncQueueTable.attemptCount} + 1`,
        lastError: errorCode,
        nextAttemptAt,
      })
      .where(eq(syncQueueTable.id, id))
      .run();
  }

  remove(id: string): void {
    this.db.delete(syncQueueTable).where(eq(syncQueueTable.id, id)).run();
  }
}
