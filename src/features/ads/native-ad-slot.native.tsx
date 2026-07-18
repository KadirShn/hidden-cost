import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  NativeAd,
  NativeAdEventType,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaAspectRatio,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';

import { AppText } from '@/components/ui/app-text';
import { runtimeConfig } from '@/config/runtime-config';
import { useAds } from '@/features/ads/use-ads';
import { useTheme } from '@/hooks/use-theme';
import { resolveAdUnitId } from '@/services/ads/ad-unit-id';
import { sendAdEvent } from '@/services/ads/send-ad-event';
import { settingsStore } from '@/store/settings-store';

type Props = {
  placement: 'dashboard' | 'template_library';
  hasContent: boolean;
};

export function NativeAdSlot({ placement, hasContent }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const ads = useAds();
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const allowed = ads.canShowNative(placement, hasContent);

  useEffect(() => {
    if (!allowed) return;
    const unitId = resolveAdUnitId({
      testMode: runtimeConfig.ads.testMode,
      testId: TestIds.NATIVE,
      productionId: runtimeConfig.ads.nativeUnitId,
    });
    if (!unitId) return;
    let active = true;
    let loadedAd: NativeAd | null = null;
    void NativeAd.createForAdRequest(unitId, {
      aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
      startVideoMuted: true,
    })
      .then((ad) => {
        if (!active) {
          ad.destroy();
          return;
        }
        loadedAd = ad;
        setNativeAd(ad);
        if (settingsStore.get('settings.adAnalyticsConsent') === 'true') {
          void sendAdEvent({ name: 'load', format: 'native', placement });
        }
        ad.addAdEventListener(NativeAdEventType.IMPRESSION, () => {
          if (settingsStore.get('settings.adAnalyticsConsent') === 'true') {
            void sendAdEvent({ name: 'impression', format: 'native', placement });
          }
        });
        ad.addAdEventListener(NativeAdEventType.CLICKED, () => {
          if (settingsStore.get('settings.adAnalyticsConsent') === 'true') {
            void sendAdEvent({ name: 'click', format: 'native', placement });
          }
        });
      })
      .catch(() => {
        if (settingsStore.get('settings.adAnalyticsConsent') === 'true') {
          void sendAdEvent({
            name: 'error',
            format: 'native',
            placement,
            reason: 'native_load_failed',
          });
        }
        // Empty space is the safe fallback for a failed native ad request.
      });
    return () => {
      active = false;
      loadedAd?.destroy();
    };
  }, [allowed, placement]);

  if (!nativeAd) return null;

  return (
    <NativeAdView
      nativeAd={nativeAd}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        gap: theme.spacing.sm,
        overflow: 'hidden',
        padding: theme.spacing.md,
      }}
    >
      <AppText tone="secondary" variant="label">
        {t('ads.sponsored')}
      </AppText>
      <NativeAsset assetType={NativeAssetType.HEADLINE}>
        <AppText variant="subtitle">{nativeAd.headline}</AppText>
      </NativeAsset>
      <NativeMediaView style={{ minHeight: 140 }} />
      <NativeAsset assetType={NativeAssetType.BODY}>
        <AppText numberOfLines={3} tone="secondary">
          {nativeAd.body}
        </AppText>
      </NativeAsset>
      <View style={{ alignItems: 'flex-start' }}>
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <AppText
            style={{
              backgroundColor: theme.colors.accent,
              borderRadius: theme.radius.md,
              color: theme.colors.accentContrast,
              paddingHorizontal: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
            }}
            variant="label"
          >
            {nativeAd.callToAction}
          </AppText>
        </NativeAsset>
      </View>
    </NativeAdView>
  );
}
