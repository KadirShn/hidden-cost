import { type Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BrandLockup } from '@/components/branding/brand-lockup';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { OnboardingPage } from '@/features/onboarding/onboarding-page';
import { useTheme } from '@/hooks/use-theme';
import { telemetry } from '@/services/observability/telemetry-service';

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const points = [
    t('onboarding.welcome.pointOne'),
    t('onboarding.welcome.pointTwo'),
    t('onboarding.welcome.pointThree'),
  ];

  useEffect(() => {
    void telemetry.track('onboarding_started', { source_screen: 'onboarding_welcome' });
  }, []);

  return (
    <OnboardingPage
      body={t('onboarding.welcome.body')}
      currentStep={1}
      eyebrow={t('onboarding.welcome.eyebrow')}
      onPrimaryPress={() => router.push('/privacy' as Href)}
      primaryLabel={t('common.continue')}
      stepLabel={t('onboarding.progress', { current: 1, total: 3 })}
      title={t('onboarding.welcome.title')}
      totalSteps={3}
    >
      <BrandLockup compact name={t('brand.name')} tagline={t('brand.tagline')} />
      <Card elevated>
        {points.map((point, index) => (
          <View key={point} style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <AppText variant="label" tone="accent">
              {index + 1}
            </AppText>
            <AppText selectable style={{ flex: 1 }}>
              {point}
            </AppText>
          </View>
        ))}
      </Card>
    </OnboardingPage>
  );
}
