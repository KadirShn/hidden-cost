import { runtimeConfig } from '@/config/runtime-config';

import { resolveAppCheckMode, type AppCheckMode } from './app-protection-config';

let initialization: Promise<AppCheckMode> | undefined;

export function initializeAppProtection(): Promise<AppCheckMode> {
  initialization ??= initialize();
  return initialization;
}

async function initialize(): Promise<AppCheckMode> {
  if (!runtimeConfig.observability.appCheckEnabled) return 'disabled';

  const { getApp } = await import('@react-native-firebase/app');
  let configured = false;
  try {
    getApp();
    configured = true;
  } catch {
    configured = false;
  }
  const mode = resolveAppCheckMode({
    configured: configured && runtimeConfig.observability.appCheckEnabled,
    environment: runtimeConfig.appEnvironment,
  });
  if (mode === 'disabled') return mode;

  const { initializeAppCheck, ReactNativeFirebaseAppCheckProvider } =
    await import('@react-native-firebase/app-check');
  const provider = new ReactNativeFirebaseAppCheckProvider();
  provider.configure({
    android: { provider: mode === 'debug' ? 'debug' : 'playIntegrity' },
    apple: {
      provider: mode === 'debug' ? 'debug' : 'appAttestWithDeviceCheckFallback',
    },
  });
  await initializeAppCheck(getApp(), {
    provider,
    isTokenAutoRefreshEnabled: true,
  });
  return mode;
}
