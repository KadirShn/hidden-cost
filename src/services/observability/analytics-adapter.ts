import type {
  AnalyticsAdapter,
  AnalyticsEventName,
  SafeAnalyticsParams,
} from './analytics-contracts';

export class NoOpAnalyticsAdapter implements AnalyticsAdapter {
  async setCollectionEnabled(): Promise<void> {
    return Promise.resolve();
  }

  async track(_name: AnalyticsEventName, _params: SafeAnalyticsParams): Promise<void> {
    return Promise.resolve();
  }
}

export const analyticsAdapter: AnalyticsAdapter = new NoOpAnalyticsAdapter();
