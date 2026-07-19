import { describe, expect, it } from '@jest/globals';

import { REMOTE_CONFIG_DEFAULTS } from './remote-config-defaults';

describe('production-safe Remote Config defaults', () => {
  it('fails closed for monetization and forced application states', () => {
    expect(REMOTE_CONFIG_DEFAULTS).toMatchObject({
      ads_enabled: false,
      native_ads_enabled: false,
      interstitial_ads_enabled: false,
      rewarded_export_enabled: false,
      maintenance_mode: false,
      force_update_enabled: false,
    });
  });

  it('keeps bounded decision-support and interstitial defaults', () => {
    expect(REMOTE_CONFIG_DEFAULTS.max_compare_items).toBe(3);
    expect(REMOTE_CONFIG_DEFAULTS.interstitial_min_completed_calculations).toBeGreaterThanOrEqual(
      3,
    );
    expect(REMOTE_CONFIG_DEFAULTS.interstitial_cooldown_minutes).toBeGreaterThanOrEqual(30);
  });
});
