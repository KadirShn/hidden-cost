import type { RemoteConfigValues } from '@/services/firebase/remote-config-defaults';

export type AdFormat = 'native' | 'interstitial' | 'rewarded';
export type AdPlacement = 'dashboard' | 'template_library' | 'post_result' | 'export';
export type RewardedOutcome = 'earned' | 'dismissed' | 'unavailable';
export type InterstitialOutcome = 'shown' | 'unavailable';

export type ConsentState = Readonly<{
  canRequestAds: boolean;
  privacyOptionsRequired: boolean;
}>;

export type AdEvent = Readonly<{
  name: 'load' | 'impression' | 'click' | 'dismiss' | 'reward' | 'error' | 'blocked';
  format: AdFormat;
  placement: AdPlacement;
  reason?: string;
}>;

export interface AdAnalytics {
  record(event: AdEvent): Promise<void> | void;
}

export interface AdsAdapter {
  initializeConsent(): Promise<ConsentState>;
  showPrivacyOptions(): Promise<ConsentState>;
  showRewarded(placement: 'export'): Promise<RewardedOutcome>;
  showInterstitial(placement: 'post_result'): Promise<InterstitialOutcome>;
}

export type AdsRemoteConfig = Pick<
  RemoteConfigValues,
  | 'ads_enabled'
  | 'native_ads_enabled'
  | 'interstitial_ads_enabled'
  | 'rewarded_export_enabled'
  | 'interstitial_min_completed_calculations'
  | 'interstitial_cooldown_minutes'
>;
