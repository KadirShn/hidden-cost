import { runtimeConfig } from '@/config/runtime-config';

import type {
  AnalyticsAdapter,
  AnalyticsEventName,
  SafeAnalyticsParams,
} from './analytics-contracts';

class FirebaseAnalyticsAdapter implements AnalyticsAdapter {
  private enabled = false;

  async setCollectionEnabled(enabled: boolean): Promise<void> {
    this.enabled = enabled && runtimeConfig.observability.analyticsEnabled;
    if (!runtimeConfig.firebase.enabled) return;
    const { getAnalytics, setAnalyticsCollectionEnabled } = loadAnalyticsModule();
    const { firebaseClient } = loadFirebaseClient();
    if (!firebaseClient.configured) return;
    await setAnalyticsCollectionEnabled(getAnalytics(), this.enabled);
  }

  async track(name: AnalyticsEventName, params: SafeAnalyticsParams): Promise<void> {
    if (!this.enabled || !runtimeConfig.firebase.enabled) return;
    const { getAnalytics, logEvent } = loadAnalyticsModule();
    const { firebaseClient } = loadFirebaseClient();
    if (!firebaseClient.configured) return;
    await logEvent(getAnalytics(), name, { ...params });
  }
}

function loadAnalyticsModule(): typeof import('@react-native-firebase/analytics') {
  // Metro's native development async evaluator is intentionally avoided for this guarded module.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-firebase/analytics');
}

function loadFirebaseClient(): typeof import('@/services/firebase/firebase-client') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/services/firebase/firebase-client');
}

export const analyticsAdapter: AnalyticsAdapter = new FirebaseAnalyticsAdapter();
