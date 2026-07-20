import path from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_ENVIRONMENTS = ['development', 'preview', 'production'] as const;
type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

const ADMOB_TEST_APP_IDS = {
  android: 'ca-app-pub-3940256099942544~3347511713',
  ios: 'ca-app-pub-3940256099942544~1458002511',
} as const;

function resolveAppEnvironment(value: string | undefined): AppEnvironment {
  const environment = value ?? 'development';

  if (!APP_ENVIRONMENTS.includes(environment as AppEnvironment)) {
    throw new Error(
      `Invalid EXPO_PUBLIC_APP_ENV "${environment}". Expected development, preview, or production.`,
    );
  }

  return environment as AppEnvironment;
}

function resolvePublicHttpsUrl(value: string | undefined, name: string, required: boolean) {
  if (!value) {
    if (required) throw new Error(`Production builds require ${name}.`);
    return null;
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== 'https:' ||
    hostname === 'localhost' ||
    hostname === 'example.com' ||
    hostname === 'example.org' ||
    hostname === 'example.net' ||
    ['.example', '.invalid', '.localhost', '.test'].some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new Error(`${name} must be a public HTTPS URL, not a placeholder.`);
  }
  return url.toString();
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnvironment = resolveAppEnvironment(process.env.EXPO_PUBLIC_APP_ENV);
  const isProduction = appEnvironment === 'production';
  const buildPlatform = process.env.EAS_BUILD_PLATFORM;
  // EAS can evaluate dynamic config locally before exposing EAS_BUILD_PLATFORM.
  // This release is Android-first, so an unspecified platform must not require
  // unavailable iOS credentials. A real iOS EAS build sets the platform to ios.
  const buildsAndroid = buildPlatform !== 'ios';
  const buildsIos = buildPlatform === 'ios';
  const androidAdMobAppId = isProduction
    ? process.env.ADMOB_ANDROID_APP_ID
    : ADMOB_TEST_APP_IDS.android;
  const iosAdMobAppId = isProduction ? process.env.ADMOB_IOS_APP_ID : ADMOB_TEST_APP_IDS.ios;

  if (isProduction && ((buildsAndroid && !androidAdMobAppId) || (buildsIos && !iosAdMobAppId))) {
    throw new Error(
      'Production builds require the platform AdMob app ID. Test IDs are never used in production.',
    );
  }
  const privacyPolicyUrl = resolvePublicHttpsUrl(
    process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
    'EXPO_PUBLIC_PRIVACY_POLICY_URL',
    isProduction,
  );
  const accountDeletionUrl = resolvePublicHttpsUrl(
    process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL,
    'EXPO_PUBLIC_ACCOUNT_DELETION_URL',
    isProduction,
  );
  const firebaseRequested = process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true';
  const androidServicesFile = process.env.FIREBASE_GOOGLE_SERVICES_FILE;
  const iosServicesFile = process.env.FIREBASE_GOOGLE_SERVICE_INFO_FILE;
  const firebaseNativeConfigured =
    firebaseRequested && Boolean(androidServicesFile || iosServicesFile);
  if (
    isProduction &&
    firebaseRequested &&
    process.env.EAS_BUILD === 'true' &&
    ((buildsAndroid && !androidServicesFile) || (buildsIos && !iosServicesFile))
  ) {
    throw new Error('Firebase-enabled production builds require the platform service file.');
  }
  const firebasePlugins: NonNullable<ExpoConfig['plugins']> = firebaseNativeConfigured
    ? [
        '@react-native-firebase/app',
        '@react-native-firebase/auth',
        '@react-native-firebase/app-check',
        '@react-native-firebase/crashlytics',
        [
          '@react-native-firebase/analytics',
          {
            ios: { withoutAdIdSupport: true },
          },
        ],
        '@react-native-google-signin/google-signin',
      ]
    : [];
  const buildPropertiesPlugin: NonNullable<ExpoConfig['plugins']>[number] = [
    'expo-build-properties',
    {
      ...(firebaseNativeConfigured
        ? {
            ios: {
              useFrameworks: 'static',
              forceStaticLinking: [
                'RNFBAnalytics',
                'RNFBApp',
                'RNFBAuth',
                'RNFBAppCheck',
                'RNFBCrashlytics',
                'RNFBFirestore',
                'RNFBFunctions',
                'RNFBRemoteConfig',
              ],
            },
          }
        : undefined),
    },
  ];

  return {
    ...config,
    name: 'Hidden Cost',
    slug: 'hidden-cost',
    plugins: [
      ...(config.plugins ?? []),
      'expo-localization',
      'expo-sqlite',
      'expo-sharing',
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: androidAdMobAppId,
          iosAppId: process.env.ADMOB_IOS_APP_ID || 'ca-app-pub-0000000000000000~0000000000',
          delayAppMeasurementInit: true,
          optimizeInitialization: true,
          optimizeAdLoading: true,
          userTrackingUsageDescription:
            'This identifier may be used to deliver and measure ads when you allow it.',
        },
      ],
      buildPropertiesPlugin,
      ...firebasePlugins,
    ],
    android: {
      ...config.android,
      ...(firebaseNativeConfigured && androidServicesFile
        ? { googleServicesFile: path.resolve(androidServicesFile) }
        : undefined),
    },
    ios: {
      ...config.ios,
      ...(firebaseNativeConfigured && iosServicesFile
        ? { googleServicesFile: path.resolve(iosServicesFile) }
        : undefined),
      ...(process.env.IOS_BUNDLE_IDENTIFIER
        ? { bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER }
        : undefined),
    },
    extra: {
      ...config.extra,
      appEnvironment,
      ads: {
        testMode: !isProduction,
        productionUnitIdsConfigured: Boolean(
          process.env.EXPO_PUBLIC_ADMOB_NATIVE_UNIT_ID &&
          process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID &&
          process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID,
        ),
      },
      firebase: {
        configured: firebaseNativeConfigured,
        emulatorHost: process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST ?? '10.0.2.2',
        googleWebClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID || null,
        useEmulators:
          appEnvironment === 'development' &&
          process.env.EXPO_PUBLIC_FIREBASE_USE_EMULATORS === 'true',
      },
      legal: {
        privacyPolicyUrl,
        accountDeletionUrl,
      },
    },
  };
};
