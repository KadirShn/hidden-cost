import {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  InterstitialAd,
  MaxAdContentRating,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  default as mobileAds,
} from 'react-native-google-mobile-ads';

import { runtimeConfig } from '@/config/runtime-config';

import { resolveAdUnitId, resolveTestDeviceIdentifiers } from './ad-unit-id';

import type {
  AdAnalytics,
  AdsAdapter,
  ConsentState,
  InterstitialOutcome,
  RewardedOutcome,
} from './contracts';

function toConsentState(info: Awaited<ReturnType<typeof AdsConsent.getConsentInfo>>): ConsentState {
  return {
    canRequestAds: info.canRequestAds,
    privacyOptionsRequired:
      info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED,
  };
}

export class GoogleMobileAdsAdapter implements AdsAdapter {
  private initialized = false;

  constructor(private readonly analytics: AdAnalytics) {}

  async initializeConsent(): Promise<ConsentState> {
    try {
      await AdsConsent.gatherConsent();
    } catch {
      // The prior-session UMP decision remains authoritative when refresh fails.
    }
    const info = await AdsConsent.getConsentInfo();
    if (info.canRequestAds && !this.initialized) {
      await mobileAds().setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        testDeviceIdentifiers: [...resolveTestDeviceIdentifiers(runtimeConfig.ads.testMode)],
      });
      await mobileAds().initialize();
      this.initialized = true;
    }
    return toConsentState(info);
  }

  async showPrivacyOptions(): Promise<ConsentState> {
    const info = await AdsConsent.showPrivacyOptionsForm();
    return toConsentState(info);
  }

  async showRewarded(placement: 'export'): Promise<RewardedOutcome> {
    const unitId = resolveAdUnitId({
      testMode: runtimeConfig.ads.testMode,
      testId: TestIds.REWARDED,
      productionId: runtimeConfig.ads.rewardedUnitId,
    });
    if (!this.initialized || !unitId) return 'unavailable';
    const ad = RewardedAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: false });

    return new Promise((resolve) => {
      let earned = false;
      let settled = false;
      let timeoutId: ReturnType<typeof setTimeout>;
      const finish = (outcome: RewardedOutcome) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        cleanup.forEach((remove) => remove());
        resolve(outcome);
      };
      const cleanup = [
        ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
          void this.analytics.record({ name: 'load', format: 'rewarded', placement });
          void ad.show().catch(() => finish('unavailable'));
        }),
        ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
          void this.analytics.record({ name: 'reward', format: 'rewarded', placement });
        }),
        ad.addAdEventListener(AdEventType.OPENED, () => {
          clearTimeout(timeoutId);
          void this.analytics.record({ name: 'impression', format: 'rewarded', placement });
        }),
        ad.addAdEventListener(AdEventType.CLICKED, () => {
          void this.analytics.record({ name: 'click', format: 'rewarded', placement });
        }),
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          void this.analytics.record({ name: 'dismiss', format: 'rewarded', placement });
          finish(earned ? 'earned' : 'dismissed');
        }),
        ad.addAdEventListener(AdEventType.ERROR, (error) => {
          void this.analytics.record({
            name: 'error',
            format: 'rewarded',
            placement,
            reason: 'code' in error && typeof error.code === 'string' ? error.code : 'ad_error',
          });
          finish('unavailable');
        }),
      ];
      timeoutId = setTimeout(() => finish('unavailable'), 15_000);
      ad.load();
    });
  }

  async showInterstitial(placement: 'post_result'): Promise<InterstitialOutcome> {
    const unitId = resolveAdUnitId({
      testMode: runtimeConfig.ads.testMode,
      testId: TestIds.INTERSTITIAL,
      productionId: runtimeConfig.ads.interstitialUnitId,
    });
    if (!this.initialized || !unitId) return 'unavailable';
    const ad = InterstitialAd.createForAdRequest(unitId);

    return new Promise((resolve) => {
      let settled = false;
      let opened = false;
      let timeoutId: ReturnType<typeof setTimeout>;
      const finish = (outcome: InterstitialOutcome) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutId);
        cleanup.forEach((remove) => remove());
        resolve(outcome);
      };
      const cleanup = [
        ad.addAdEventListener(AdEventType.LOADED, () => {
          void this.analytics.record({ name: 'load', format: 'interstitial', placement });
          void ad.show().catch(() => finish('unavailable'));
        }),
        ad.addAdEventListener(AdEventType.OPENED, () => {
          opened = true;
          clearTimeout(timeoutId);
          void this.analytics.record({ name: 'impression', format: 'interstitial', placement });
        }),
        ad.addAdEventListener(AdEventType.CLICKED, () => {
          void this.analytics.record({ name: 'click', format: 'interstitial', placement });
        }),
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          void this.analytics.record({ name: 'dismiss', format: 'interstitial', placement });
          finish('shown');
        }),
        ad.addAdEventListener(AdEventType.ERROR, (error) => {
          void this.analytics.record({
            name: 'error',
            format: 'interstitial',
            placement,
            reason: 'code' in error && typeof error.code === 'string' ? error.code : 'ad_error',
          });
          finish(opened ? 'shown' : 'unavailable');
        }),
      ];
      timeoutId = setTimeout(() => finish('unavailable'), 15_000);
      ad.load();
    });
  }
}
