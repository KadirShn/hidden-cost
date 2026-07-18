import { describe, expect, it } from '@jest/globals';

import { createTestDatabase } from '@/data/database/testing/test-database';
import type { RepositoryDependencies } from '@/data/repositories/dependencies';
import { SQLiteProjectRepository } from '@/data/repositories/project-repository';
import { SQLiteSyncQueueRepository } from '@/data/repositories/sync-queue-repository';
import { projectFixture } from '@/domain/calculation/__fixtures__/builders';

const dependencies: RepositoryDependencies = {
  createId: () => 'queue-project',
  now: () => '2026-07-19T10:00:00.000Z',
  deviceId: 'device-a',
};

describe('SQLiteSyncQueueRepository', () => {
  it('atomically removes a completed queue record and marks the entity synced', () => {
    const { sqlite, database } = createTestDatabase();
    new SQLiteProjectRepository(database, dependencies).create(projectFixture(), []);
    const queue = new SQLiteSyncQueueRepository(database);
    const record = queue.listReady()[0];

    queue.complete(record);

    expect(queue.getSummary().pending).toBe(0);
    expect(sqlite.prepare('SELECT sync_status FROM projects').get()).toMatchObject({
      sync_status: 'synced',
    });
    sqlite.close();
  });

  it('blocks a newer remote revision for explicit conflict handling', () => {
    const { sqlite, database } = createTestDatabase();
    new SQLiteProjectRepository(database, dependencies).create(projectFixture(), []);
    const queue = new SQLiteSyncQueueRepository(database);
    const record = queue.listReady()[0];

    queue.recordConflict(record);

    expect(queue.getSummary()).toMatchObject({ pending: 1, failed: 1, conflicts: 1 });
    expect(queue.listReady()).toHaveLength(0);
    expect(sqlite.prepare('SELECT sync_status FROM projects').get()).toMatchObject({
      sync_status: 'conflict',
    });
    sqlite.close();
  });
});
