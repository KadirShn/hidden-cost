import { describe, expect, it, jest } from '@jest/globals';

import { TelemetryService } from './telemetry-service';

import type { AnalyticsAdapter, SafeAnalyticsParams } from './analytics-contracts';

describe('TelemetryService', () => {
  it('does not emit events before analytics consent', async () => {
    const adapter: AnalyticsAdapter = {
      setCollectionEnabled: jest.fn<() => Promise<void>>().mockResolvedValue(),
      track: jest.fn<() => Promise<void>>().mockResolvedValue(),
    };
    const service = new TelemetryService(adapter);

    await service.track('app_opened', { locale: 'en' });

    expect(adapter.track).not.toHaveBeenCalled();
  });

  it('sanitizes again at the adapter boundary after consent', async () => {
    const track = jest.fn<() => Promise<void>>().mockResolvedValue();
    const adapter: AnalyticsAdapter = {
      setCollectionEnabled: jest.fn<() => Promise<void>>().mockResolvedValue(),
      track,
    };
    const service = new TelemetryService(adapter);
    await service.setConsent(true);

    await service.track('calculation_completed', {
      locale: 'tr',
      source_screen: 'wizard',
      ...({ title: 'secret', amount: '999999' } as SafeAnalyticsParams),
    });

    expect(track).toHaveBeenCalledWith('calculation_completed', {
      locale: 'tr',
      source_screen: 'wizard',
    });
  });
});
