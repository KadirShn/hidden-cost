import { runtimeConfig, type RuntimeConfig } from '@/config/runtime-config';

export type AppInitializationResult = Readonly<{
  appEnvironment: RuntimeConfig['appEnvironment'];
}>;

export async function initializeApplication(
  config: RuntimeConfig = runtimeConfig,
): Promise<AppInitializationResult> {
  return Promise.resolve({ appEnvironment: config.appEnvironment });
}
