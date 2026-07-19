import { createContext, useCallback, useMemo, type PropsWithChildren } from 'react';

import { getInitialLocale, i18n, isAppLocale, type AppLocale } from '@/i18n';
import { setAdEventAnalyticsEnabled } from '@/services/ads/send-ad-event';
import { telemetry } from '@/services/observability/telemetry-service';
import { settingsStore , usePersistentSetting } from '@/store/settings-store';
import type { ThemePreference } from '@/theme/tokens';

type SettingsContextValue = Readonly<{
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
  onboardingCompleted: boolean;
  completeOnboarding: () => void;
  analyticsConsent: boolean;
  setAnalyticsConsent: (enabled: boolean) => void;
}>;

export const SettingsContext = createContext<SettingsContextValue | null>(null);

const isThemePreference = (value: string): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark';
const isBooleanSetting = (value: string): value is 'true' | 'false' =>
  value === 'true' || value === 'false';

export function SettingsProvider({ children }: PropsWithChildren) {
  const [locale, persistLocale] = usePersistentSetting(
    'settings.locale',
    getInitialLocale(),
    isAppLocale,
  );
  const [themePreference, setThemePreference] = usePersistentSetting(
    'settings.theme',
    'system',
    isThemePreference,
  );
  const [onboardingValue, setOnboardingValue] = usePersistentSetting(
    'settings.onboardingCompleted',
    'false',
    isBooleanSetting,
  );
  const [analyticsValue, setAnalyticsValue] = usePersistentSetting(
    'settings.analyticsConsent',
    settingsStore.get('settings.adAnalyticsConsent') === 'true' ? 'true' : 'false',
    isBooleanSetting,
  );

  const setLocale = useCallback(
    (nextLocale: AppLocale) => {
      persistLocale(nextLocale);
      void i18n.changeLanguage(nextLocale);
    },
    [persistLocale],
  );
  const completeOnboarding = useCallback(() => setOnboardingValue('true'), [setOnboardingValue]);
  const setAnalyticsConsent = useCallback(
    (enabled: boolean) => {
      setAnalyticsValue(String(enabled) as 'true' | 'false');
      settingsStore.set('settings.analyticsConsentVersion', '1');
      void setAdEventAnalyticsEnabled(enabled);
      void telemetry.track('consent_status_updated', { source_screen: 'settings' });
    },
    [setAnalyticsValue],
  );
  const value = useMemo<SettingsContextValue>(
    () => ({
      locale,
      setLocale,
      themePreference,
      setThemePreference,
      onboardingCompleted: onboardingValue === 'true',
      completeOnboarding,
      analyticsConsent: analyticsValue === 'true',
      setAnalyticsConsent,
    }),
    [
      analyticsValue,
      completeOnboarding,
      locale,
      onboardingValue,
      setAnalyticsConsent,
      setLocale,
      setThemePreference,
      themePreference,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
