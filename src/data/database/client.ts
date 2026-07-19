import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { deleteDatabaseSync, openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { runtimeConfig } from '@/config/runtime-config';
import { runMigrations } from '@/data/database/migration-runner';
import { databaseSchema, type DatabaseSchema } from '@/data/database/schema';
import { SQLiteAppSettingsRepository } from '@/data/repositories/app-settings-repository';
import { defaultRepositoryDependencies } from '@/data/repositories/dependencies';
import { SQLiteLocalDataRepository } from '@/data/repositories/local-data-repository';
import { SQLiteProjectRepository } from '@/data/repositories/project-repository';
import { SQLiteScenarioRepository } from '@/data/repositories/scenario-repository';
import { SQLiteSyncQueueRepository } from '@/data/repositories/sync-queue-repository';
import { SQLiteTemplateRepository } from '@/data/repositories/template-repository';
import type {
  AppSettingsRepository,
  ProjectRepository,
  ScenarioRepository,
  SyncQueueRepository,
  TemplateRepository,
  UserProfileRepository,
  LocalDataRepository,
} from '@/data/repositories/types';
import { SQLiteUserProfileRepository } from '@/data/repositories/user-profile-repository';
import { seedTemplateCache } from '@/data/templates/seed';

export const DATABASE_NAME = 'hidden-cost.db';
export const DEVELOPMENT_RESET_CONFIRMATION = 'RESET_HIDDEN_COST_DATABASE';

export type DatabaseServices = {
  projects: ProjectRepository;
  scenarios: ScenarioRepository;
  templates: TemplateRepository;
  userProfiles: UserProfileRepository;
  settings: AppSettingsRepository;
  syncQueue: SyncQueueRepository;
  localData: LocalDataRepository;
};

type DatabaseState = {
  sqlite: SQLiteDatabase;
  drizzle: ExpoSQLiteDatabase<DatabaseSchema>;
  services: DatabaseServices;
};

let state: DatabaseState | null = null;

function createState(): DatabaseState {
  const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
  sqlite.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  runMigrations(sqlite);
  const database = drizzle(sqlite, { schema: databaseSchema });
  seedTemplateCache(database);
  const dependencies = defaultRepositoryDependencies;
  return {
    sqlite,
    drizzle: database,
    services: {
      projects: new SQLiteProjectRepository(database, dependencies),
      scenarios: new SQLiteScenarioRepository(database, dependencies),
      templates: new SQLiteTemplateRepository(database),
      userProfiles: new SQLiteUserProfileRepository(database, dependencies),
      settings: new SQLiteAppSettingsRepository(database, dependencies),
      syncQueue: new SQLiteSyncQueueRepository(database),
      localData: new SQLiteLocalDataRepository(database),
    },
  };
}

export function initializeDatabase(): DatabaseServices {
  state ??= createState();
  return state.services;
}

export function getDatabaseServices(): DatabaseServices {
  if (!state) throw new Error('Database has not been initialized');
  return state.services;
}

export function resetDatabaseForDevelopment(confirmation: string): DatabaseServices {
  if (!isDatabaseResetAvailable()) {
    throw new Error('Database reset is available only in development builds');
  }
  if (confirmation !== DEVELOPMENT_RESET_CONFIRMATION) {
    throw new Error('Explicit database reset confirmation is required');
  }

  state?.sqlite.closeSync();
  state = null;
  deleteDatabaseSync(DATABASE_NAME);
  return initializeDatabase();
}

export function isDatabaseResetAvailable(): boolean {
  return __DEV__ && runtimeConfig.appEnvironment === 'development';
}
