import { telemetry } from '@/services/observability/telemetry-service';

import type { AdEvent } from './contracts';

export async function sendAdEvent(_event: AdEvent): Promise<void> {
  return sendApprovedAdEvent(_event);
}

export async function setAdEventAnalyticsEnabled(_enabled: boolean): Promise<void> {
  return telemetry.setConsent(_enabled);
}

export async function sendApprovedAdEvent(event: AdEvent): Promise<void> {
  const params = { source_screen: event.placement } as const;
  if (event.format === 'native' && event.name === 'impression') {
    await telemetry.track('ad_native_impression', params);
  }
  if (event.format === 'interstitial' && event.name === 'impression') {
    await telemetry.track('ad_interstitial_shown', params);
  }
  if (event.format === 'rewarded' && event.name === 'load') {
    await telemetry.track('ad_rewarded_started', params);
  }
  if (event.format === 'rewarded' && event.name === 'reward') {
    await telemetry.track('ad_rewarded_completed', params);
  }
}
