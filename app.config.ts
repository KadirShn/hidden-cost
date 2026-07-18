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

export default ({ config }: ConfigContext): ExpoConfig => {
  const appEnvironment = resolveAppEnvironment(process.env.EXPO_PUBLIC_APP_ENV);

  return {
    ...config,
    name: 'Hidden Cost',
    slug: 'hidden-cost',
    plugins: [...(config.plugins ?? []), 'expo-localization', 'expo-sqlite', 'expo-sharing'],
    extra: {
      ...config.extra,
      appEnvironment,
    },
  };
};
