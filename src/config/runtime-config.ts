import { resolveAppEnvironment } from '@/config/app-environment';

export type RuntimeConfig = Readonly<{
  appEnvironment: ReturnType<typeof resolveAppEnvironment>;
  firebase: Readonly<{
    enabled: boolean;
    useEmulators: boolean;
    emulatorHost: string;
    googleWebClientId?: string;
  }>;
  ads: Readonly<{
    testMode: boolean;
    nativeUnitId?: string;
    interstitialUnitId?: string;
    rewardedUnitId?: string;
  }>;
  observability: Readonly<{
    analyticsEnabled: boolean;
    crashlyticsEnabled: boolean;
    appCheckEnabled: boolean;
    appCheckProvider: 'debug' | 'playIntegrity';
  }>;
}>;

export const runtimeConfig: RuntimeConfig = Object.freeze({
  appEnvironment: resolveAppEnvironment(process.env.EXPO_PUBLIC_APP_ENV),
  firebase: Object.freeze({
    enabled: process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true',
    useEmulators:
      process.env.EXPO_PUBLIC_APP_ENV !== 'production' &&
      process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS === 'true',
    emulatorHost: process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ?? '10.0.2.2',
    googleWebClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID || undefined,
  }),
  ads: Object.freeze({
    testMode: process.env.EXPO_PUBLIC_APP_ENV !== 'production',
    nativeUnitId: process.env.EXPO_PUBLIC_ADMOB_NATIVE_UNIT_ID || undefined,
    interstitialUnitId: process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID || undefined,
    rewardedUnitId: process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID || undefined,
  }),
  observability: Object.freeze({
    analyticsEnabled: process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true',
    crashlyticsEnabled:
      process.env.EXPO_PUBLIC_APP_ENV === 'production' &&
      process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true',
    appCheckEnabled: process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true',
    appCheckProvider: process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'playIntegrity' : 'debug',
  }),
});
