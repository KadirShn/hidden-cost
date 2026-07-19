export type AppCheckMode = 'disabled' | 'debug' | 'playIntegrity';

export function resolveAppCheckMode(input: {
  configured: boolean;
  environment: 'development' | 'preview' | 'production';
}): AppCheckMode {
  if (!input.configured) return 'disabled';
  return input.environment === 'production' ? 'playIntegrity' : 'debug';
}
