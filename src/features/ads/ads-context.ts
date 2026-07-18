import { createContext } from 'react';

import type { ConsentState, RewardedOutcome } from '@/services/ads/contracts';

export type AdsContextValue = Readonly<{
  consent: ConsentState;
  ready: boolean;
  privacyOptionsAvailable: boolean;
  rewardedExportEnabled: boolean;
  canShowNative: (
    placement: 'dashboard' | 'template_library',
    hasContent: boolean,
  ) => boolean;
  requestRewardedExport: (userOptedIn: boolean) => Promise<RewardedOutcome>;
  maybeShowPostResultInterstitial: (completedCalculations: number) => Promise<void>;
  openPrivacyOptions: () => Promise<void>;
}>;

const DISABLED_ADS_CONTEXT: AdsContextValue = {
  consent: { canRequestAds: false, privacyOptionsRequired: false },
  ready: false,
  privacyOptionsAvailable: false,
  rewardedExportEnabled: false,
  canShowNative: () => false,
  requestRewardedExport: async () => 'unavailable',
  maybeShowPostResultInterstitial: async () => undefined,
  openPrivacyOptions: async () => undefined,
};

export const AdsContext = createContext<AdsContextValue>(DISABLED_ADS_CONTEXT);
