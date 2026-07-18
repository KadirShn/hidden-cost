import { migrations, type Migration } from './migrations';

import type { SQLiteBindValue } from 'expo-sqlite';

export type MigrationRecord = {
  version: number;
  name: string;
  checksum: string;
  appliedAt: string;
};

export type MigrationClient = {
  execSync(source: string): void;
  getAllSync<T>(source: string, ...params: SQLiteBindValue[]): T[];
  runSync(source: string, ...params: SQLiteBindValue[]): unknown;
  withTransactionSync(task: () => void): void;
};

export class MigrationIntegrityError extends Error {
  constructor(version: number) {
    super(`Migration ${version} does not match the recorded checksum`);
    this.name = 'MigrationIntegrityError';
  }
}

const bootstrapSql = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    checksum TEXT NOT NULL,
    applied_at TEXT NOT NULL
  );
`;

export function runMigrations(
  client: MigrationClient,
  availableMigrations: readonly Migration[] = migrations,
  now: () => string = () => new Date().toISOString(),
): MigrationRecord[] {
  client.execSync(bootstrapSql);
  const applied = client.getAllSync<MigrationRecord>(
    'SELECT version, name, checksum, applied_at AS appliedAt FROM schema_migrations ORDER BY version',
  );
  const appliedByVersion = new Map(applied.map((record) => [record.version, record]));

  for (const migration of availableMigrations) {
    const existing = appliedByVersion.get(migration.version);
    if (existing) {
      if (existing.checksum !== migration.checksum || existing.name !== migration.name) {
        throw new MigrationIntegrityError(migration.version);
      }
      continue;
    }

    client.withTransactionSync(() => {
      client.execSync(migration.sql);
      client.runSync(
        'INSERT INTO schema_migrations (version, name, checksum, applied_at) VALUES (?, ?, ?, ?)',
        migration.version,
        migration.name,
        migration.checksum,
        now(),
      );
    });
  }

  return client.getAllSync<MigrationRecord>(
    'SELECT version, name, checksum, applied_at AS appliedAt FROM schema_migrations ORDER BY version',
  );
}
