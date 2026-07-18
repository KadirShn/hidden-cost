import { type Href, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { OnboardingPage } from '@/features/onboarding/onboarding-page';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <OnboardingPage
      body={t('onboarding.privacy.body')}
      currentStep={2}
      eyebrow={t('onboarding.privacy.eyebrow')}
      onPrimaryPress={() => router.push('/preferences' as Href)}
      onSecondaryPress={() => router.back()}
      primaryLabel={t('common.continue')}
      secondaryLabel={t('common.back')}
      stepLabel={t('onboarding.progress', { current: 2, total: 3 })}
      title={t('onboarding.privacy.title')}
      totalSteps={3}
    >
      <Card>
        <AppText variant="subtitle">{t('onboarding.privacy.localTitle')}</AppText>
        <AppText selectable tone="secondary">
          {t('onboarding.privacy.localBody')}
        </AppText>
      </Card>
      <Card>
        <AppText variant="subtitle">{t('onboarding.privacy.transparentTitle')}</AppText>
        <AppText selectable tone="secondary">
          {t('onboarding.privacy.transparentBody')}
        </AppText>
      </Card>
      <AppText selectable variant="helper" tone="secondary">
        {t('onboarding.privacy.disclaimer')}
      </AppText>
    </OnboardingPage>
  );
}
