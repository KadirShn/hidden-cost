import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { SelectField } from '@/components/ui/select-field';
import { useAds } from '@/features/ads/use-ads';
import { CloudBackupSettings } from '@/features/cloud-backup/cloud-backup-settings';
import { DeveloperDatabaseTools } from '@/features/developer-tools/database-tools';
import { DeveloperObservabilityTools } from '@/features/developer-tools/observability-tools';
import { PrivacyControls } from '@/features/privacy/privacy-controls';
import { useSettings } from '@/features/settings/use-settings';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const ads = useAds();
  const {
    locale,
    setLocale,
    themePreference,
    setThemePreference,
    analyticsConsent,
    setAnalyticsConsent,
  } = useSettings();

  return (
    <Screen>
      <DeveloperDatabaseTools />
      <DeveloperObservabilityTools />

      <CloudBackupSettings />

      <PrivacyControls />

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="subtitle">{t('settings.appearanceSection')}</AppText>
        <Card>
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
          <Divider />
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
        </Card>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="subtitle">{t('ads.privacySection')}</AppText>
        <Card>
          <AppText variant="label">{t('ads.privacyOptionsTitle')}</AppText>
          <AppText selectable tone="secondary">
            {t('ads.privacyOptionsBody')}
          </AppText>
          <Button
            disabled={!ads.privacyOptionsAvailable}
            label={t('ads.openPrivacyOptions')}
            onPress={() => void ads.openPrivacyOptions()}
            variant="secondary"
          />
          {!ads.privacyOptionsAvailable ? (
            <AppText tone="secondary" variant="helper">
              {t('ads.privacyOptionsUnavailable')}
            </AppText>
          ) : null}
          <Divider />
          <View
            style={{ flexDirection: 'row', gap: theme.spacing.md, justifyContent: 'space-between' }}
          >
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <AppText variant="label">{t('ads.analyticsTitle')}</AppText>
              <AppText tone="secondary">{t('ads.analyticsBody')}</AppText>
            </View>
            <Switch
              accessibilityLabel={t('ads.analyticsTitle')}
              onValueChange={setAnalyticsConsent}
              value={analyticsConsent}
            />
          </View>
        </Card>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="subtitle">{t('settings.accessibilitySection')}</AppText>
        <Card accessibilityState={{ checked: reducedMotion }}>
          <AppText variant="label">{t('settings.reducedMotionTitle')}</AppText>
          <AppText selectable tone="secondary">
            {t('settings.reducedMotionSystem')}
          </AppText>
        </Card>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="subtitle">{t('settings.aboutSection')}</AppText>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText tone="secondary">{t('settings.versionLabel')}</AppText>
            <AppText selectable>{Constants.expoConfig?.version ?? '1.0.0'}</AppText>
          </View>
          <Divider />
          <View style={{ gap: theme.spacing.sm }}>
            <AppText tone="secondary">{t('settings.phaseLabel')}</AppText>
            <AppText selectable>{t('settings.phaseValue')}</AppText>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
