export const APP_ENVIRONMENTS = ['development', 'preview', 'production'] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

export function resolveAppEnvironment(value: string | undefined): AppEnvironment {
  const environment = value ?? 'development';

  if (!APP_ENVIRONMENTS.includes(environment as AppEnvironment)) {
    throw new Error('EXPO_PUBLIC_APP_ENV must be development, preview, or production.');
  }

  return environment as AppEnvironment;
}
