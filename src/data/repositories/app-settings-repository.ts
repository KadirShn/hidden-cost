import { eq } from 'drizzle-orm';

import { appSettingsTable } from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import {
  defaultRepositoryDependencies,
  type RepositoryDependencies,
} from '@/data/repositories/dependencies';
import type { AppSettingsRepository } from '@/data/repositories/types';

export class SQLiteAppSettingsRepository<TRunResult> implements AppSettingsRepository {
  constructor(
    private readonly db: AppDatabase<TRunResult>,
    private readonly dependencies: RepositoryDependencies = defaultRepositoryDependencies,
  ) {}

  get<T>(key: string): T | null {
    const row = this.db.select().from(appSettingsTable).where(eq(appSettingsTable.key, key)).get();
    return row ? (JSON.parse(row.valueJson) as T) : null;
  }

  set<T>(key: string, value: T): void {
    const valueJson = JSON.stringify(value);
    const updatedAt = this.dependencies.now();
    this.db
      .insert(appSettingsTable)
      .values({ key, valueJson, updatedAt })
      .onConflictDoUpdate({ target: appSettingsTable.key, set: { valueJson, updatedAt } })
      .run();
  }
}
