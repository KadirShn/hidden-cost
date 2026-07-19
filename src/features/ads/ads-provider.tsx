import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { ConsentAwareAdAnalytics } from '@/services/ads/ad-analytics';
import { AdsPolicyService } from '@/services/ads/ads-policy-service';
import type { ConsentState } from '@/services/ads/contracts';
import { GoogleMobileAdsAdapter } from '@/services/ads/google-mobile-ads-adapter';
import { sendAdEvent } from '@/services/ads/send-ad-event';
import { firebaseClient } from '@/services/firebase/firebase-client';
import { REMOTE_CONFIG_DEFAULTS } from '@/services/firebase/remote-config-defaults';
import { settingsStore } from '@/store/settings-store';

import { AdsContext, type AdsContextValue } from './ads-context';

const ANALYTICS_CONSENT_KEY = 'settings.analyticsConsent';
const LAUNCHED_BEFORE_KEY = 'ads.launchedBefore';

export function AdsProvider({ children }: PropsWithChildren) {
  const [firstSession] = useState(settingsStore.get(LAUNCHED_BEFORE_KEY) !== 'true');
  const [consent, setConsent] = useState<ConsentState>({
    canRequestAds: false,
    privacyOptionsRequired: false,
  });
  const [ready, setReady] = useState(false);
  const [rewardedExportEnabled, setRewardedExportEnabled] = useState(false);
  const [service] = useState(() => {
    const analytics = new ConsentAwareAdAnalytics(
      () => settingsStore.get(ANALYTICS_CONSENT_KEY) === 'true',
      sendAdEvent,
    );
    return new AdsPolicyService(
      REMOTE_CONFIG_DEFAULTS,
      new GoogleMobileAdsAdapter(analytics),
      settingsStore,
      analytics,
    );
  });

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      const config = await firebaseClient.initializeRemoteConfig();
      if (!active) return;
      service.updateConfig(config);
      const nextConsent = await service.initialize();
      if (!active) return;
      setConsent(nextConsent);
      setRewardedExportEnabled(service.isRewardedExportEnabled());
      setReady(true);
      settingsStore.set(LAUNCHED_BEFORE_KEY, 'true');
    };
    void initialize();
    return () => {
      active = false;
    };
  }, [service]);

  const canShowNative = useCallback(
    (placement: 'dashboard' | 'template_library', hasContent: boolean) =>
      service.canShowNative(placement, hasContent),
    [service],
  );
  const requestRewardedExport = useCallback(
    (userOptedIn: boolean) => service.requestRewardedExport(userOptedIn),
    [service],
  );
  const maybeShowPostResultInterstitial = useCallback(
    async (completedCalculations: number) => {
      await service.maybeShowInterstitial({
        placement: 'post_result',
        completedCalculations,
        isFirstSession: firstSession,
        wizardActive: false,
      });
    },
    [firstSession, service],
  );
  const openPrivacyOptions = useCallback(async () => {
    const nextConsent = await service.openPrivacyOptions();
    setConsent(nextConsent);
    setRewardedExportEnabled(service.isRewardedExportEnabled());
  }, [service]);

  const value = useMemo<AdsContextValue>(
    () => ({
      consent,
      ready,
      privacyOptionsAvailable: consent.privacyOptionsRequired,
      rewardedExportEnabled,
      canShowNative,
      requestRewardedExport,
      maybeShowPostResultInterstitial,
      openPrivacyOptions,
    }),
    [
      canShowNative,
      consent,
      maybeShowPostResultInterstitial,
      openPrivacyOptions,
      ready,
      requestRewardedExport,
      rewardedExportEnabled,
    ],
  );

  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}
