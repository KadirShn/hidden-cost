import type { ConfigContext, ExpoConfig } from 'expo/config';
import path from 'node:path';

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

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnvironment = resolveAppEnvironment(process.env.EXPO_PUBLIC_APP_ENV);
  const firebaseRequested = process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true';
  const androidServicesFile = process.env.FIREBASE_GOOGLE_SERVICES_FILE;
  const iosServicesFile = process.env.FIREBASE_GOOGLE_SERVICE_INFO_FILE;
  const firebaseNativeConfigured =
    firebaseRequested && Boolean(androidServicesFile || iosServicesFile);
  const firebasePlugins: NonNullable<ExpoConfig['plugins']> = firebaseNativeConfigured
    ? [
        '@react-native-firebase/app',
        '@react-native-firebase/auth',
        [
          '@react-native-firebase/analytics',
          {
            ios: { withoutAdIdSupport: true },
          },
        ],
        '@react-native-google-signin/google-signin',
        [
          'expo-build-properties',
          {
            ios: {
              useFrameworks: 'static',
              forceStaticLinking: [
                'RNFBAnalytics',
                'RNFBApp',
                'RNFBAuth',
                'RNFBFirestore',
                'RNFBFunctions',
                'RNFBRemoteConfig',
              ],
            },
          },
        ],
      ]
    : [];

  return {
    ...config,
    name: 'Hidden Cost',
    slug: 'hidden-cost',
    plugins: [
      ...(config.plugins ?? []),
      'expo-localization',
      'expo-sqlite',
      'expo-sharing',
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
    },
  };
};
