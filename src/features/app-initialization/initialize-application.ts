import { runtimeConfig, type RuntimeConfig } from '@/config/runtime-config';
import { initializeDatabase, type DatabaseServices } from '@/data/database/client';

export type AppInitializationResult = Readonly<{
  appEnvironment: RuntimeConfig['appEnvironment'];
  databaseReady: true;
}>;

export class DatabaseInitializationError extends Error {
  constructor() {
    super('Local database initialization failed');
    this.name = 'DatabaseInitializationError';
  }
}

export async function initializeApplication(
  config: RuntimeConfig = runtimeConfig,
  databaseInitializer: () => DatabaseServices = initializeDatabase,
): Promise<AppInitializationResult> {
  try {
    databaseInitializer();
  } catch {
    throw new DatabaseInitializationError();
  }
  return Promise.resolve({ appEnvironment: config.appEnvironment, databaseReady: true });
}
