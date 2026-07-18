import { describe, expect, it } from '@jest/globals';

import { AdsPolicyService } from './ads-policy-service';

import type {
  AdAnalytics,
  AdEvent,
  AdsAdapter,
  AdsRemoteConfig,
  ConsentState,
  InterstitialOutcome,
  RewardedOutcome,
} from './contracts';

const enabledConfig: AdsRemoteConfig = {
  ads_enabled: true,
  native_ads_enabled: true,
  interstitial_ads_enabled: true,
  rewarded_export_enabled: true,
  interstitial_min_completed_calculations: 3,
  interstitial_cooldown_minutes: 30,
};

class MemoryStorage {
  private values = new Map<string, string>();

  get(key: string) {
    return this.values.get(key) ?? null;
  }

  set(key: string, value: string) {
    this.values.set(key, value);
  }
}

class FakeAdapter implements AdsAdapter {
  consent: ConsentState = { canRequestAds: true, privacyOptionsRequired: true };
  rewarded: RewardedOutcome = 'earned';
  interstitial: InterstitialOutcome = 'shown';
  consentCalls = 0;
  rewardedCalls = 0;
  interstitialCalls = 0;

  async initializeConsent() {
    this.consentCalls += 1;
    return this.consent;
  }

  async showPrivacyOptions() {
    return this.consent;
  }

  async showRewarded() {
    this.rewardedCalls += 1;
    return this.rewarded;
  }

  async showInterstitial() {
    this.interstitialCalls += 1;
    return this.interstitial;
  }
}

class FakeAnalytics implements AdAnalytics {
  events: AdEvent[] = [];

  record(event: AdEvent) {
    this.events.push(event);
  }
}

function setup(config: AdsRemoteConfig = enabledConfig, now = 1_000_000) {
  const adapter = new FakeAdapter();
  const storage = new MemoryStorage();
  const analytics = new FakeAnalytics();
  const service = new AdsPolicyService(config, adapter, storage, analytics, () => now);
  return { adapter, analytics, service, storage };
}

describe('AdsPolicyService', () => {
  it('does not initialize the SDK when the global Remote Config switch is off', async () => {
    const { adapter, service } = setup({ ...enabledConfig, ads_enabled: false });

    await service.initialize();

    expect(adapter.consentCalls).toBe(0);
    expect(service.canShowNative('dashboard', true)).toBe(false);
    expect(await service.requestRewardedExport(true)).toBe('unavailable');
  });

  it('requires current UMP permission and content for native placements', async () => {
    const { adapter, service } = setup();
    adapter.consent = { canRequestAds: false, privacyOptionsRequired: true };
    await service.initialize();
    expect(service.canShowNative('dashboard', true)).toBe(false);

    adapter.consent = { canRequestAds: true, privacyOptionsRequired: true };
    await service.initialize();
    expect(service.canShowNative('dashboard', false)).toBe(false);
    expect(service.canShowNative('template_library', true)).toBe(true);
  });

  it('handles rewarded rejection without invoking the adapter', async () => {
    const { adapter, analytics, service } = setup();
    await service.initialize();

    await expect(service.requestRewardedExport(false)).resolves.toBe('dismissed');
    expect(adapter.rewardedCalls).toBe(0);
    expect(analytics.events[0]).toMatchObject({ reason: 'opt_in_declined' });
  });

  it('returns an unavailable rewarded result as a safe export fallback', async () => {
    const { adapter, service } = setup();
    adapter.rewarded = 'unavailable';
    await service.initialize();

    await expect(service.requestRewardedExport(true)).resolves.toBe('unavailable');
  });

  it('never shows interstitials in the first session, wizard, or before the threshold', async () => {
    const { adapter, service } = setup();
    await service.initialize();
    const base = { placement: 'post_result' as const, completedCalculations: 3 };

    await service.maybeShowInterstitial({ ...base, isFirstSession: true, wizardActive: false });
    await service.maybeShowInterstitial({ ...base, isFirstSession: false, wizardActive: true });
    await service.maybeShowInterstitial({
      ...base,
      completedCalculations: 2,
      isFirstSession: false,
      wizardActive: false,
    });

    expect(adapter.interstitialCalls).toBe(0);
  });

  it('applies the completed-calculation threshold and cooldown after a safe post-result break', async () => {
    let now = 1_000_000;
    const adapter = new FakeAdapter();
    const storage = new MemoryStorage();
    const service = new AdsPolicyService(
      enabledConfig,
      adapter,
      storage,
      new FakeAnalytics(),
      () => now,
    );
    await service.initialize();
    const input = {
      placement: 'post_result' as const,
      completedCalculations: 3,
      isFirstSession: false,
      wizardActive: false,
    };

    await expect(service.maybeShowInterstitial(input)).resolves.toBe('shown');
    await expect(service.maybeShowInterstitial(input)).resolves.toBe('unavailable');
    now += 30 * 60_000;
    await expect(service.maybeShowInterstitial(input)).resolves.toBe('shown');
    expect(adapter.interstitialCalls).toBe(2);
  });
});
