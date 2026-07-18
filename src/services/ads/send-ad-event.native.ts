import type { AdEvent } from './contracts';

export async function sendAdEvent(event: AdEvent): Promise<void> {
  const [{ getAnalytics, logEvent, setAnalyticsCollectionEnabled }, { firebaseClient }] =
    await Promise.all([
      import('@react-native-firebase/analytics'),
      import('@/services/firebase/firebase-client'),
    ]);
  if (!firebaseClient.configured) return;
  const analytics = getAnalytics();
  await setAnalyticsCollectionEnabled(analytics, true);
  await logEvent(analytics, `ad_${event.name}`, {
    ad_format: event.format,
    placement: event.placement,
    ...(event.reason ? { reason: event.reason.slice(0, 100) } : undefined),
  });
}

export async function setAdEventAnalyticsEnabled(enabled: boolean): Promise<void> {
  const [{ getAnalytics, setAnalyticsCollectionEnabled }, { firebaseClient }] = await Promise.all([
    import('@react-native-firebase/analytics'),
    import('@/services/firebase/firebase-client'),
  ]);
  if (!firebaseClient.configured) return;
  await setAnalyticsCollectionEnabled(getAnalytics(), enabled);
}
