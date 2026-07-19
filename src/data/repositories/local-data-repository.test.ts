import { describe, expect, it } from '@jest/globals';

import { createTestDatabase } from '@/data/database/testing/test-database';
import { SQLiteLocalDataRepository } from '@/data/repositories/local-data-repository';
import { SQLiteProjectRepository } from '@/data/repositories/project-repository';
import { projectFixture } from '@/domain/calculation/__fixtures__/builders';

describe('SQLiteLocalDataRepository', () => {
  it('exports stored user data and permanently deletes it transactionally', () => {
    const { database, sqlite } = createTestDatabase();
    new SQLiteProjectRepository(database).create(projectFixture(), []);
    const repository = new SQLiteLocalDataRepository(
      database,
      () => '2026-07-19T12:00:00.000Z',
    );

    expect(repository.exportSnapshot()).toMatchObject({
      formatVersion: 1,
      exportedAt: '2026-07-19T12:00:00.000Z',
      projects: [{ id: 'project-1' }],
    });
    repository.deleteAll();
    expect(repository.exportSnapshot()).toMatchObject({
      projects: [],
      costItems: [],
      scenarioOverrides: [],
      syncQueue: [],
    });
    sqlite.close();
  });
});
