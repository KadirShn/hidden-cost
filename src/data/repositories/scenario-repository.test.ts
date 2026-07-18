import { describe, expect, it } from '@jest/globals';

import { createTestDatabase } from '@/data/database/testing/test-database';
import type { RepositoryDependencies } from '@/data/repositories/dependencies';
import { SQLiteProjectRepository } from '@/data/repositories/project-repository';
import { SQLiteScenarioRepository } from '@/data/repositories/scenario-repository';
import { projectFixture } from '@/domain/calculation/__fixtures__/builders';

function dependencies(): RepositoryDependencies {
  let id = 0;
  return {
    createId: () => `generated-${++id}`,
    now: () => '2026-01-02T00:00:00.000Z',
    deviceId: 'test-device',
  };
}

describe('SQLiteScenarioRepository', () => {
  it('atomically replaces one scenario and soft deletes removed paths', () => {
    const { sqlite, database } = createTestDatabase();
    const deps = dependencies();
    new SQLiteProjectRepository(database, deps).create(projectFixture(), []);
    const repository = new SQLiteScenarioRepository(database, deps);
    const record = (id: string, path: string, value: string) => ({
      id,
      projectId: 'project-1',
      scenario: 'low' as const,
      path,
      value,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    repository.replace('project-1', 'low', [
      record('usage', 'project.usagePerMonth', '100'),
      record('price', 'project.purchasePriceMinor', '900000'),
    ]);
    repository.replace('project-1', 'low', [record('usage-new', 'project.usagePerMonth', '120')]);

    expect(repository.list('project-1')).toEqual([
      expect.objectContaining({ id: 'usage', path: 'project.usagePerMonth', value: '120' }),
    ]);
    expect(
      sqlite.prepare('SELECT deleted_at FROM scenario_overrides WHERE id = ?').get('price'),
    ).toEqual(expect.objectContaining({ deleted_at: expect.any(String) }));
    sqlite.close();
  });
});
