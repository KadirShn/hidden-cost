import { asc, eq, isNull, lte, or, sql } from 'drizzle-orm';

import {
  costItemsTable,
  projectsTable,
  scenarioOverridesTable,
  syncQueueTable,
} from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import type {
  SyncQueueRecord,
  SyncQueueRepository,
  SyncQueueSummary,
} from '@/data/repositories/types';

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

  getSummary(): SyncQueueSummary {
    const records = this.db.select().from(syncQueueTable).all().map(fromRow);
    const retryDates = records.flatMap(({ nextAttemptAt }) =>
      nextAttemptAt && !nextAttemptAt.startsWith('9999') ? [nextAttemptAt] : [],
    );
    return {
      pending: records.length,
      failed: records.filter(({ lastError }) => Boolean(lastError)).length,
      conflicts: records.filter(({ lastError }) => lastError === 'conflict/remote-newer').length,
      nextAttemptAt: retryDates.sort()[0],
    };
  }

  complete(record: SyncQueueRecord): void {
    this.db.transaction((tx) => {
      this.setEntityStatus(tx, record, 'synced');
      tx.delete(syncQueueTable).where(eq(syncQueueTable.id, record.id)).run();
    });
  }

  recordFailure(record: SyncQueueRecord, errorCode: string, nextAttemptAt: string): void {
    this.db.transaction((tx) => {
      this.setEntityStatus(tx, record, 'failed');
      tx.update(syncQueueTable)
        .set({
          attemptCount: sql`${syncQueueTable.attemptCount} + 1`,
          lastError: errorCode,
          nextAttemptAt,
        })
        .where(eq(syncQueueTable.id, record.id))
        .run();
    });
  }

  recordConflict(record: SyncQueueRecord): void {
    this.db.transaction((tx) => {
      this.setEntityStatus(tx, record, 'conflict');
      tx.update(syncQueueTable)
        .set({ lastError: 'conflict/remote-newer', nextAttemptAt: '9999-12-31T23:59:59.999Z' })
        .where(eq(syncQueueTable.id, record.id))
        .run();
    });
  }

  private setEntityStatus(
    db: AppDatabase<TRunResult>,
    record: SyncQueueRecord,
    status: 'synced' | 'failed' | 'conflict',
  ): void {
    if (record.entityType === 'project') {
      db.update(projectsTable)
        .set({ syncStatus: status })
        .where(eq(projectsTable.id, record.entityId))
        .run();
    } else if (record.entityType === 'cost_item') {
      db.update(costItemsTable)
        .set({ syncStatus: status })
        .where(eq(costItemsTable.id, record.entityId))
        .run();
    } else if (record.entityType === 'scenario_override') {
      db.update(scenarioOverridesTable)
        .set({ syncStatus: status })
        .where(eq(scenarioOverridesTable.id, record.entityId))
        .run();
    }
  }
}
