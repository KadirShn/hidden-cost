import { createContext, useCallback, useMemo, type PropsWithChildren } from 'react';

import { getInitialLocale, i18n, isAppLocale, type AppLocale } from '@/i18n';
import { usePersistentSetting } from '@/store/settings-store';
import type { ThemePreference } from '@/theme/tokens';

type SettingsContextValue = Readonly<{
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  themePreference: ThemePreference;
  setThemePreference: (theme: ThemePreference) => void;
  onboardingCompleted: boolean;
  completeOnboarding: () => void;
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

  const setLocale = useCallback(
    (nextLocale: AppLocale) => {
      persistLocale(nextLocale);
      void i18n.changeLanguage(nextLocale);
    },
    [persistLocale],
  );
  const completeOnboarding = useCallback(() => setOnboardingValue('true'), [setOnboardingValue]);
  const value = useMemo<SettingsContextValue>(
    () => ({
      locale,
      setLocale,
      themePreference,
      setThemePreference,
      onboardingCompleted: onboardingValue === 'true',
      completeOnboarding,
    }),
    [completeOnboarding, locale, onboardingValue, setLocale, setThemePreference, themePreference],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
