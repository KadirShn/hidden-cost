import { describe, expect, it } from '@jest/globals';

import { resolveAppEnvironment } from '@/config/app-environment';

describe('resolveAppEnvironment', () => {
  it('defaults to development', () => {
    expect(resolveAppEnvironment(undefined)).toBe('development');
  });

  it.each(['development', 'preview', 'production'] as const)(
    'accepts the %s environment',
    (environment) => {
      expect(resolveAppEnvironment(environment)).toBe(environment);
    },
  );

  it('rejects unknown environments', () => {
    expect(() => resolveAppEnvironment('staging')).toThrow(
      'EXPO_PUBLIC_APP_ENV must be development, preview, or production.',
    );
  });
});
