import type {
  AdAnalytics,
  AdsAdapter,
  AdsRemoteConfig,
  ConsentState,
  InterstitialOutcome,
  RewardedOutcome,
} from './contracts';

export type AdsPolicyStorage = {
  get(key: string): string | null;
  set(key: string, value: string): void;
};

const LAST_INTERSTITIAL_AT = 'ads.lastInterstitialAt';

export class AdsPolicyService {
  private consent: ConsentState = { canRequestAds: false, privacyOptionsRequired: false };

  constructor(
    private config: AdsRemoteConfig,
    private readonly adapter: AdsAdapter,
    private readonly storage: AdsPolicyStorage,
    private readonly analytics: AdAnalytics,
    private readonly now: () => number = Date.now,
  ) {}

  updateConfig(config: AdsRemoteConfig): void {
    this.config = config;
  }

  async initialize(): Promise<ConsentState> {
    if (!this.config.ads_enabled) return this.consent;
    this.consent = await this.adapter.initializeConsent().catch(() => this.consent);
    return this.consent;
  }

  getConsentState(): ConsentState {
    return this.consent;
  }

  canShowNative(placement: 'dashboard' | 'template_library', hasContent: boolean): boolean {
    return (
      hasContent &&
      this.config.ads_enabled &&
      this.config.native_ads_enabled &&
      this.consent.canRequestAds &&
      (placement === 'dashboard' || placement === 'template_library')
    );
  }

  isRewardedExportEnabled(): boolean {
    return (
      this.config.ads_enabled && this.config.rewarded_export_enabled && this.consent.canRequestAds
    );
  }

  async requestRewardedExport(userOptedIn: boolean): Promise<RewardedOutcome> {
    if (!this.isRewardedExportEnabled()) return 'unavailable';
    if (!userOptedIn) {
      await this.analytics.record({
        name: 'blocked',
        format: 'rewarded',
        placement: 'export',
        reason: 'opt_in_declined',
      });
      return 'dismissed';
    }
    return this.adapter.showRewarded('export').catch(() => 'unavailable');
  }

  async maybeShowInterstitial(input: {
    placement: 'post_result';
    completedCalculations: number;
    isFirstSession: boolean;
    wizardActive: boolean;
  }): Promise<InterstitialOutcome> {
    if (
      !this.config.ads_enabled ||
      !this.config.interstitial_ads_enabled ||
      !this.consent.canRequestAds ||
      input.isFirstSession ||
      input.wizardActive ||
      input.completedCalculations < this.config.interstitial_min_completed_calculations
    ) {
      return 'unavailable';
    }

    const lastShownAt = Number(this.storage.get(LAST_INTERSTITIAL_AT) ?? 0);
    const cooldownMs = this.config.interstitial_cooldown_minutes * 60_000;
    if (lastShownAt > 0 && this.now() - lastShownAt < cooldownMs) return 'unavailable';

    const outcome: InterstitialOutcome = await this.adapter
      .showInterstitial(input.placement)
      .catch((): InterstitialOutcome => 'unavailable');
    if (outcome === 'shown') this.storage.set(LAST_INTERSTITIAL_AT, String(this.now()));
    return outcome;
  }

  async openPrivacyOptions(): Promise<ConsentState> {
    this.consent = await this.adapter.showPrivacyOptions().catch(() => this.consent);
    return this.consent;
  }
}
