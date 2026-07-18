import { describe, expect, it } from '@jest/globals';

import { resolveAdUnitId } from './ad-unit-id';

describe('resolveAdUnitId', () => {
  it('always uses the SDK test ID in development and preview', () => {
    expect(
      resolveAdUnitId({
        testMode: true,
        testId: 'google-test-id',
        productionId: 'live-id-that-must-be-ignored',
      }),
    ).toBe('google-test-id');
  });

  it('never substitutes a test ID in production', () => {
    expect(resolveAdUnitId({ testMode: false, testId: 'google-test-id' })).toBeUndefined();
    expect(
      resolveAdUnitId({
        testMode: false,
        testId: 'google-test-id',
        productionId: 'production-id',
      }),
    ).toBe('production-id');
  });
});
