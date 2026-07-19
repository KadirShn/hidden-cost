import {
  appSettingsTable,
  costItemsTable,
  projectsTable,
  scenarioOverridesTable,
  syncQueueTable,
  userProfileTable,
} from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import type { LocalDataRepository, LocalDataSnapshot } from '@/data/repositories/types';

export class SQLiteLocalDataRepository<TRunResult> implements LocalDataRepository {
  constructor(
    private readonly db: AppDatabase<TRunResult>,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  exportSnapshot(): LocalDataSnapshot {
    return {
      formatVersion: 1,
      exportedAt: this.now(),
      profiles: this.db.select().from(userProfileTable).all(),
      projects: this.db.select().from(projectsTable).all(),
      costItems: this.db.select().from(costItemsTable).all(),
      scenarioOverrides: this.db.select().from(scenarioOverridesTable).all(),
      appSettings: this.db.select().from(appSettingsTable).all(),
      syncQueue: this.db.select().from(syncQueueTable).all(),
    };
  }

  deleteAll(): void {
    this.db.transaction((tx) => {
      tx.delete(scenarioOverridesTable).run();
      tx.delete(costItemsTable).run();
      tx.delete(projectsTable).run();
      tx.delete(syncQueueTable).run();
      tx.delete(userProfileTable).run();
      tx.delete(appSettingsTable).run();
    });
  }
}
