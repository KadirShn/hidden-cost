import { type Href, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { SelectField } from '@/components/ui/select-field';
import { OnboardingPage } from '@/features/onboarding/onboarding-page';
import { useSettings } from '@/features/settings/use-settings';
import { telemetry } from '@/services/observability/telemetry-service';

export default function PreferencesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { locale, setLocale, themePreference, setThemePreference, completeOnboarding } =
    useSettings();

  return (
    <OnboardingPage
      body={t('onboarding.preferences.body')}
      currentStep={3}
      eyebrow={t('onboarding.preferences.eyebrow')}
      onPrimaryPress={() => {
        completeOnboarding();
        void telemetry.track('onboarding_completed', { locale, source_screen: 'onboarding' });
        router.replace('/home' as Href);
      }}
      onSecondaryPress={() => router.back()}
      primaryLabel={t('common.finish')}
      secondaryLabel={t('common.back')}
      stepLabel={t('onboarding.progress', { current: 3, total: 3 })}
      title={t('onboarding.preferences.title')}
      totalSteps={3}
    >
      <SelectField
        cancelLabel={t('common.cancel')}
        helperText={t('settings.languageHelp')}
        label={t('settings.languageLabel')}
        modalTitle={t('settings.languageModalTitle')}
        onChange={setLocale}
        openAccessibilityLabel={t('accessibility.openSelection', {
          label: t('settings.languageLabel'),
        })}
        options={[
          { label: t('settings.turkish'), value: 'tr' },
          { label: t('settings.english'), value: 'en' },
        ]}
        selectedAccessibilityLabel={t('accessibility.selected')}
        value={locale}
      />
      <SelectField
        cancelLabel={t('common.cancel')}
        helperText={t('settings.themeHelp')}
        label={t('settings.themeLabel')}
        modalTitle={t('settings.themeModalTitle')}
        onChange={setThemePreference}
        openAccessibilityLabel={t('accessibility.openSelection', {
          label: t('settings.themeLabel'),
        })}
        options={[
          { label: t('settings.themeSystem'), value: 'system' },
          { label: t('settings.themeLight'), value: 'light' },
          { label: t('settings.themeDark'), value: 'dark' },
        ]}
        selectedAccessibilityLabel={t('accessibility.selected')}
        value={themePreference}
      />
    </OnboardingPage>
  );
}
