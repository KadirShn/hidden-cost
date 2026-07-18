import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';

import { createTestDatabase } from '@/data/database/testing/test-database';
import type { RepositoryDependencies } from '@/data/repositories/dependencies';
import { SQLiteProjectRepository } from '@/data/repositories/project-repository';
import { SQLiteSyncQueueRepository } from '@/data/repositories/sync-queue-repository';
import { costItemFixture, projectFixture } from '@/domain/calculation/__fixtures__/builders';

function dependencies(): RepositoryDependencies {
  let id = 0;
  let tick = 0;
  return {
    createId: () => `generated-${++id}`,
    now: () => `2026-01-01T00:00:${String(++tick).padStart(2, '0')}.000Z`,
    deviceId: 'test-device',
  };
}

describe('SQLiteProjectRepository', () => {
  it('creates and reads a project offline and preserves it across repository instances', () => {
    const { sqlite, database } = createTestDatabase();
    const deps = dependencies();
    const first = new SQLiteProjectRepository(database, deps);
    const project = projectFixture({ status: 'draft' });
    const item = costItemFixture();

    first.create(project, [item]);
    const reopened = new SQLiteProjectRepository(database, deps);
    expect(reopened.getBundle(project.id)).toMatchObject({
      project: { id: project.id, title: project.title, status: 'draft' },
      costItems: [{ id: item.id }],
    });
    expect(new SQLiteSyncQueueRepository(database).listReady()).toHaveLength(2);
    sqlite.close();
  });

  it('persists a project after the SQLite file is closed and reopened', () => {
    const databasePath = join(tmpdir(), `hidden-cost-${process.pid}-${Date.now()}.db`);
    try {
      const first = createTestDatabase(databasePath);
      new SQLiteProjectRepository(first.database, dependencies()).create(projectFixture(), []);
      first.sqlite.close();

      const reopened = createTestDatabase(databasePath);
      expect(
        new SQLiteProjectRepository(reopened.database, dependencies()).getById('project-1'),
      ).toMatchObject({ id: 'project-1', purchasePriceMinor: '1000000' });
      reopened.sqlite.close();
    } finally {
      rmSync(databasePath, { force: true });
      rmSync(`${databasePath}-shm`, { force: true });
      rmSync(`${databasePath}-wal`, { force: true });
    }
  });

  it('autosaves patches without losing fields and coalesces the sync queue payload', () => {
    const { sqlite, database } = createTestDatabase();
    const repository = new SQLiteProjectRepository(database, dependencies());
    repository.create(projectFixture(), []);

    repository.autosaveDraft('project-1', { title: 'First autosave' });
    const saved = repository.autosaveDraft('project-1', { ownershipMonths: 48 });

    expect(saved).toMatchObject({
      title: 'First autosave',
      ownershipMonths: 48,
      purchasePriceMinor: '1000000',
      status: 'draft',
    });
    const queued = sqlite
      .prepare("SELECT operation, payload_json FROM sync_queue WHERE entity_type = 'project'")
      .all() as { operation: string; payload_json: string }[];
    expect(queued).toHaveLength(1);
    expect(JSON.parse(queued[0].payload_json)).toMatchObject({
      title: 'First autosave',
      ownershipMonths: 48,
      revision: 3,
      deviceId: 'test-device',
    });
    sqlite.close();
  });

  it('saves wizard project and cost items as one bundle', () => {
    const { sqlite, database } = createTestDatabase();
    const repository = new SQLiteProjectRepository(database, dependencies());
    repository.create(projectFixture({ status: 'draft' }), []);

    const saved = repository.saveBundle({
      project: projectFixture({ title: 'Motorcycle result', purchasePriceMinor: '30000000' }),
      costItems: [
        costItemFixture({
          id: 'maintenance',
          key: 'maintenance',
          type: 'recurring',
          frequency: 'annual',
          amountMinor: '1200000',
        }),
      ],
      scenarioOverrides: [],
    });

    expect(saved.project).toMatchObject({
      title: 'Motorcycle result',
      purchasePriceMinor: '30000000',
    });
    expect(repository.getBundle('project-1')?.costItems).toEqual([
      expect.objectContaining({ id: 'maintenance', amountMinor: '1200000' }),
    ]);
    sqlite.close();
  });

  it('duplicates items, archives, and hides archived projects by default', () => {
    const { sqlite, database } = createTestDatabase();
    const repository = new SQLiteProjectRepository(database, dependencies());
    repository.create(projectFixture(), [costItemFixture()]);

    const duplicate = repository.duplicate({ projectId: 'project-1', title: 'Copy' });
    expect(duplicate.project).toMatchObject({ title: 'Copy', status: 'draft' });
    expect(duplicate.project.id).not.toBe('project-1');
    expect(duplicate.costItems).toHaveLength(1);
    expect(duplicate.costItems[0].id).not.toBe('item-1');

    repository.archive(duplicate.project.id);
    expect(repository.list().map(({ id }) => id)).toEqual(['project-1']);
    expect(repository.list({ includeArchived: true })).toHaveLength(2);
    sqlite.close();
  });

  it('soft deletes the entity and writes a matching delete queue operation', () => {
    const { sqlite, database } = createTestDatabase();
    const repository = new SQLiteProjectRepository(database, dependencies());
    repository.create(projectFixture(), [costItemFixture()]);

    repository.softDelete('project-1');

    expect(repository.getById('project-1')).toBeNull();
    expect(sqlite.prepare("SELECT deleted_at FROM projects WHERE id = 'project-1'").get()).toEqual(
      expect.objectContaining({ deleted_at: expect.any(String) }),
    );
    expect(
      sqlite
        .prepare("SELECT operation FROM sync_queue WHERE entity_type = 'project' AND entity_id = ?")
        .get('project-1'),
    ).toEqual({ operation: 'delete' });
    expect(
      sqlite
        .prepare(
          "SELECT operation FROM sync_queue WHERE entity_type = 'cost_item' AND entity_id = ?",
        )
        .get('item-1'),
    ).toEqual({ operation: 'delete' });
    sqlite.close();
  });

  it('rolls back entity and queue writes together when a transaction fails', () => {
    const { sqlite, database } = createTestDatabase();
    const repository = new SQLiteProjectRepository(database, dependencies());
    const duplicateItem = costItemFixture();

    expect(() => repository.create(projectFixture(), [duplicateItem, duplicateItem])).toThrow();
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM projects').get()).toEqual({ count: 0 });
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM sync_queue').get()).toEqual({ count: 0 });
    sqlite.close();
  });
});
