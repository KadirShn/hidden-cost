import { describe, expect, it, jest } from '@jest/globals';

import { ConsentAwareAdAnalytics } from './ad-analytics';

import type { AdEvent } from './contracts';


const event = { name: 'load', format: 'native', placement: 'dashboard' } as const;

describe('ConsentAwareAdAnalytics', () => {
  it('does not send events without the separate analytics opt-in', async () => {
    const send = jest.fn<(value: AdEvent) => Promise<void>>().mockResolvedValue();
    const analytics = new ConsentAwareAdAnalytics(() => false, send);

    await analytics.record(event);

    expect(send).not.toHaveBeenCalled();
  });

  it('sends only the policy-safe ad event payload after opt-in', async () => {
    const send = jest.fn<(value: AdEvent) => Promise<void>>().mockResolvedValue();
    const analytics = new ConsentAwareAdAnalytics(() => true, send);

    await analytics.record(event);

    expect(send).toHaveBeenCalledWith(event);
    expect(send.mock.calls[0][0]).not.toHaveProperty('cost');
    expect(send.mock.calls[0][0]).not.toHaveProperty('projectId');
  });
});
