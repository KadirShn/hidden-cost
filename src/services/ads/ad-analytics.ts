import type { AdAnalytics, AdEvent } from './contracts';

export class ConsentAwareAdAnalytics implements AdAnalytics {
  constructor(
    private readonly isEnabled: () => boolean,
    private readonly send: (event: AdEvent) => Promise<void>,
  ) {}

  async record(event: AdEvent): Promise<void> {
    if (!this.isEnabled()) return;
    await this.send(event).catch(() => undefined);
  }
}
