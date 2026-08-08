import path from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_ENVIRONMENTS = ['development', 'preview', 'production'] as const;
type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

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
