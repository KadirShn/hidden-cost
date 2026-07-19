import { runtimeConfig, type RuntimeConfig } from '@/config/runtime-config';
import { initializeDatabase, type DatabaseServices } from '@/data/database/client';
import { performanceMonitor } from '@/services/performance/performance-monitor';

export type AppInitializationResult = Readonly<{
  appEnvironment: RuntimeConfig['appEnvironment'];
  databaseReady: true;
  startupDurationMs: number;
}>;

export class DatabaseInitializationError extends Error {
  constructor() {
    super('Local database initialization failed');
    this.name = 'DatabaseInitializationError';
  }
}

export async function initializeApplication(
  config: Pick<RuntimeConfig, 'appEnvironment'> = runtimeConfig,
  databaseInitializer: () => DatabaseServices = initializeDatabase,
): Promise<AppInitializationResult> {
  const startedAt = globalThis.performance?.now() ?? Date.now();
  try {
    databaseInitializer();
  } catch {
    throw new DatabaseInitializationError();
  }
  return Promise.resolve({
    appEnvironment: config.appEnvironment,
    databaseReady: true,
    startupDurationMs: performanceMonitor.measureStartup('database_ready', startedAt),
  });
}
