import { type ErrorBoundaryProps } from 'expo-router';
import Stack from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';

import { FatalErrorScreen } from '@/components/feedback/fatal-error-screen';
import { AppInitializationGate } from '@/features/app-initialization/app-initialization-gate';
import { SettingsProvider } from '@/features/settings/settings-provider';
import { i18n } from '@/i18n';
import { AppThemeProvider } from '@/theme/theme-provider';

void SplashScreen.preventAutoHideAsync();

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <FatalErrorScreen
      actionLabel={i18n.t('common.retry')}
      message={i18n.t('app.fatalMessage')}
      onRetry={retry}
      title={i18n.t('app.fatalTitle')}
    />
  );
}

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <AppThemeProvider>
          <StatusBar style="auto" />
          <AppInitializationGate>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AppInitializationGate>
        </AppThemeProvider>
      </SettingsProvider>
    </I18nextProvider>
  );
}
