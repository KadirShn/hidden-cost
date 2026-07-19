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
    const [{ getAnalytics, setAnalyticsCollectionEnabled }, { firebaseClient }] =
      await Promise.all([
        import('@react-native-firebase/analytics'),
        import('@/services/firebase/firebase-client'),
      ]);
    if (!firebaseClient.configured) return;
    await setAnalyticsCollectionEnabled(getAnalytics(), this.enabled);
  }

  async track(name: AnalyticsEventName, params: SafeAnalyticsParams): Promise<void> {
    if (!this.enabled) return;
    const [{ getAnalytics, logEvent }, { firebaseClient }] = await Promise.all([
      import('@react-native-firebase/analytics'),
      import('@/services/firebase/firebase-client'),
    ]);
    if (!firebaseClient.configured) return;
    await logEvent(getAnalytics(), name, { ...params });
  }
}

export const analyticsAdapter: AnalyticsAdapter = new FirebaseAnalyticsAdapter();
