import { describe, expect, it } from '@jest/globals';

import { REMOTE_CONFIG_DEFAULTS } from './remote-config-defaults';

describe('production-safe Remote Config defaults', () => {
  it('fails closed for forced application states', () => {
    expect(REMOTE_CONFIG_DEFAULTS).toMatchObject({
      maintenance_mode: false,
      force_update_enabled: false,
    });
  });

  it('keeps bounded decision-support defaults', () => {
    expect(REMOTE_CONFIG_DEFAULTS.max_compare_items).toBe(3);
    expect(REMOTE_CONFIG_DEFAULTS.minimum_supported_version).toBe('1.0.0');
  });
});
