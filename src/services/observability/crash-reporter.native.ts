import Constants from 'expo-constants';

import { runtimeConfig } from '@/config/runtime-config';

import { AppError } from './errors';
import { sanitizeLogContext, type SafeLogContext } from './redaction';

import type { CrashReporter } from './crash-reporter';

class FirebaseCrashReporter implements CrashReporter {
  private configured = false;

  async initialize(): Promise<void> {
    if (!runtimeConfig.firebase.enabled) return;
    const { getCrashlytics, setCrashlyticsCollectionEnabled } = loadCrashlyticsModule();
    const { firebaseClient } = loadFirebaseClient();
    this.configured = firebaseClient.configured;
    if (!this.configured) return;
    await setCrashlyticsCollectionEnabled(
      getCrashlytics(),
      runtimeConfig.observability.crashlyticsEnabled,
    );
  }

  async record(error: AppError, context: SafeLogContext = {}): Promise<void> {
    if (!this.configured || !runtimeConfig.observability.crashlyticsEnabled) return;
    await this.send(error, context);
  }

  async recordDevelopmentTest(): Promise<boolean> {
    if (!this.configured || runtimeConfig.appEnvironment !== 'development') return false;
    const { getCrashlytics, setCrashlyticsCollectionEnabled } = loadCrashlyticsModule();
    await setCrashlyticsCollectionEnabled(getCrashlytics(), true);
    await this.send(new AppError('dev/test_non_fatal'));
    return true;
  }

  private async send(error: AppError, context: SafeLogContext = {}): Promise<void> {
    const { getCrashlytics, recordError, setAttributes } = loadCrashlyticsModule();
    const crashlytics = getCrashlytics();
    const safe = sanitizeLogContext({
      ...context,
      error_code: error.code,
      app_version: Constants.expoConfig?.version ?? 'unknown',
    });
    await setAttributes(
      crashlytics,
      Object.fromEntries(Object.entries(safe).map(([key, value]) => [key, String(value)])),
    );
    recordError(crashlytics, new Error(error.code), error.code);
  }
}

function loadCrashlyticsModule(): typeof import('@react-native-firebase/crashlytics') {
  // Metro's native development async evaluator is intentionally avoided for this guarded module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-firebase/crashlytics');
}

function loadFirebaseClient(): typeof import('@/services/firebase/firebase-client') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/services/firebase/firebase-client');
}

export const crashReporter: CrashReporter = new FirebaseCrashReporter();
