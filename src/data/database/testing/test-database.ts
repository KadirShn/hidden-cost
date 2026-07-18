import BetterSQLite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import type { MigrationClient } from '@/data/database/migration-runner';
import { runMigrations } from '@/data/database/migration-runner';
import { databaseSchema } from '@/data/database/schema';

export function createTestDatabase(source = ':memory:') {
  const sqlite = new BetterSQLite3(source);
  sqlite.pragma('foreign_keys = ON');
  const migrationClient: MigrationClient = {
    execSync: (source) => sqlite.exec(source),
    getAllSync: <T>(source: string, ...params: never[]) =>
      sqlite.prepare(source).all(...params) as T[],
    runSync: (source, ...params) => sqlite.prepare(source).run(...params),
    withTransactionSync: (task) => sqlite.transaction(task)(),
  };
  runMigrations(migrationClient, undefined, () => '2026-01-01T00:00:00.000Z');
  const database = drizzle(sqlite, { schema: databaseSchema });
  return { sqlite, migrationClient, database };
}
