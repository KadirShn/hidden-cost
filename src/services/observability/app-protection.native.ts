import { runtimeConfig } from '@/config/runtime-config';

import { resolveAppCheckMode, type AppCheckMode } from './app-protection-config';

let initialization: Promise<AppCheckMode> | undefined;

export function initializeAppProtection(): Promise<AppCheckMode> {
  initialization ??= initialize();
  return initialization;
}

async function initialize(): Promise<AppCheckMode> {
  if (!runtimeConfig.observability.appCheckEnabled) return 'disabled';

  const { getApp } = loadFirebaseAppModule();
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

  const { initializeAppCheck, ReactNativeFirebaseAppCheckProvider } = loadAppCheckModule();
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

function loadFirebaseAppModule(): typeof import('@react-native-firebase/app') {
  // Metro's native development async evaluator is intentionally avoided for this guarded module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-firebase/app');
}

function loadAppCheckModule(): typeof import('@react-native-firebase/app-check') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-firebase/app-check');
}
