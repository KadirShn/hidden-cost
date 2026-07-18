import { jest } from '@jest/globals';

const values = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
    removeItem: (key: string) => values.delete(key),
    setItem: (key: string, value: string) => values.set(key, value),
  },
});

jest.mock('expo-sqlite/localStorage/install', () => ({}));

jest.mock('react-native-google-mobile-ads', () => ({
  __esModule: true,
  default: () => ({
    initialize: async () => [],
    setRequestConfiguration: async () => undefined,
  }),
  AdEventType: {
    CLICKED: 'clicked',
    CLOSED: 'closed',
    ERROR: 'error',
    LOADED: 'loaded',
    OPENED: 'opened',
  },
  AdsConsent: {
    gatherConsent: async () => undefined,
    getConsentInfo: async () => ({
      canRequestAds: false,
      privacyOptionsRequirementStatus: 'NOT_REQUIRED',
    }),
    showPrivacyOptionsForm: async () => ({
      canRequestAds: false,
      privacyOptionsRequirementStatus: 'NOT_REQUIRED',
    }),
  },
  AdsConsentPrivacyOptionsRequirementStatus: { REQUIRED: 'REQUIRED' },
  InterstitialAd: { createForAdRequest: jest.fn() },
  MaxAdContentRating: { PG: 'PG' },
  RewardedAd: { createForAdRequest: jest.fn() },
  RewardedAdEventType: { EARNED_REWARD: 'rewarded_earned_reward', LOADED: 'rewarded_loaded' },
  TestIds: {
    INTERSTITIAL: 'test-interstitial',
    NATIVE: 'test-native',
    REWARDED: 'test-rewarded',
  },
}));
