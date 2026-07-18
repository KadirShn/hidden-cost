import type { AdsAdapter, ConsentState, InterstitialOutcome, RewardedOutcome } from './contracts';

const NO_CONSENT: ConsentState = { canRequestAds: false, privacyOptionsRequired: false };

export class NoOpAdsAdapter implements AdsAdapter {
  constructor(..._args: unknown[]) {
    void _args;
  }

  async initializeConsent(): Promise<ConsentState> {
    return NO_CONSENT;
  }

  async showPrivacyOptions(): Promise<ConsentState> {
    return NO_CONSENT;
  }

  async showRewarded(): Promise<RewardedOutcome> {
    return 'unavailable';
  }

  async showInterstitial(): Promise<InterstitialOutcome> {
    return 'unavailable';
  }
}
