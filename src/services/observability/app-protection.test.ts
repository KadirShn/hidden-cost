import { describe, expect, it } from '@jest/globals';

import { resolveAppCheckMode } from './app-protection-config';

describe('resolveAppCheckMode', () => {
  it('uses the debug provider outside production', () => {
    expect(resolveAppCheckMode({ configured: true, environment: 'development' })).toBe('debug');
    expect(resolveAppCheckMode({ configured: true, environment: 'preview' })).toBe('debug');
  });

  it('uses Play Integrity in production and disables unconfigured builds', () => {
    expect(resolveAppCheckMode({ configured: true, environment: 'production' })).toBe(
      'playIntegrity',
    );
    expect(resolveAppCheckMode({ configured: false, environment: 'production' })).toBe('disabled');
  });
});
