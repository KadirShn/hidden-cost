import { describe, expect, it } from '@jest/globals';

import { MigrationIntegrityError, runMigrations } from '@/data/database/migration-runner';
import { migrations } from '@/data/database/migrations';
import { createTestDatabase } from '@/data/database/testing/test-database';

describe('database migrations', () => {
  it('creates the complete Phase 4 schema', () => {
    const { sqlite } = createTestDatabase();
    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => (row as { name: string }).name);

    expect(tables).toEqual([
      'app_settings',
      'cost_items',
      'projects',
      'scenario_overrides',
      'schema_migrations',
      'sync_queue',
      'template_cache',
      'user_profile',
    ]);
    sqlite.close();
  });

  it('is idempotent', () => {
    const { sqlite, migrationClient } = createTestDatabase();
    expect(runMigrations(migrationClient)).toHaveLength(1);
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get()).toEqual({
      count: 1,
    });
    sqlite.close();
  });

  it('rolls back a failed migration without deleting existing data', () => {
    const { sqlite, migrationClient } = createTestDatabase();
    sqlite.prepare("INSERT INTO app_settings VALUES ('keep', 'true', 'now')").run();

    expect(() =>
      runMigrations(migrationClient, [
        ...migrations,
        {
          version: 2,
          name: 'broken',
          checksum: 'broken-v1',
          sql: 'CREATE TABLE should_rollback (id TEXT); INVALID SQL;',
        },
      ]),
    ).toThrow();
    expect(sqlite.prepare("SELECT value_json FROM app_settings WHERE key = 'keep'").get()).toEqual({
      value_json: 'true',
    });
    expect(
      sqlite.prepare("SELECT name FROM sqlite_master WHERE name = 'should_rollback'").get(),
    ).toBeUndefined();
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get()).toEqual({
      count: 1,
    });
    sqlite.close();
  });

  it('rejects a changed checksum for an applied migration', () => {
    const { sqlite, migrationClient } = createTestDatabase();
    expect(() =>
      runMigrations(migrationClient, [{ ...migrations[0], checksum: 'changed' }]),
    ).toThrow(MigrationIntegrityError);
    sqlite.close();
  });
});
