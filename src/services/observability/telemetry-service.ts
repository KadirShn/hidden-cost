import { analyticsAdapter } from './analytics-adapter';
import { sanitizeAnalyticsParams } from './analytics-sanitizer';

import type {
  AnalyticsAdapter,
  AnalyticsEventMap,
  AnalyticsEventName,
} from './analytics-contracts';

export class TelemetryService {
  private consent = false;

  constructor(private readonly adapter: AnalyticsAdapter = analyticsAdapter) {}

  async setConsent(enabled: boolean): Promise<void> {
    this.consent = enabled;
    await this.adapter.setCollectionEnabled(enabled).catch(() => undefined);
  }

  async track<Name extends AnalyticsEventName>(
    name: Name,
    params: AnalyticsEventMap[Name] = {},
  ): Promise<void> {
    if (!this.consent) return;
    const safeParams = sanitizeAnalyticsParams(params as Record<string, unknown>);
    await this.adapter.track(name, safeParams).catch(() => undefined);
  }
}

export const telemetry = new TelemetryService();
