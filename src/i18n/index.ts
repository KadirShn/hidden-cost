import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { settingsStore } from '@/store/settings-store';

import { en } from './resources/en';
import { tr } from './resources/tr';

export const supportedLocales = ['tr', 'en'] as const;
export type AppLocale = (typeof supportedLocales)[number];

export function isAppLocale(value: string): value is AppLocale {
  return supportedLocales.includes(value as AppLocale);
}

export function getDeviceLocale(): AppLocale {
  const languageCode = getLocales()[0]?.languageCode;
  return languageCode && isAppLocale(languageCode) ? languageCode : 'en';
}

export function getInitialLocale(): AppLocale {
  const storedLocale = settingsStore.get('settings.locale');
  return storedLocale && isAppLocale(storedLocale) ? storedLocale : getDeviceLocale();
}

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: getInitialLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});
