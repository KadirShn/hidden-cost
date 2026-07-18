import type { AdEvent } from './contracts';

export async function sendAdEvent(_event: AdEvent): Promise<void> {
  return Promise.resolve();
}

export async function setAdEventAnalyticsEnabled(_enabled: boolean): Promise<void> {
  return Promise.resolve();
}
