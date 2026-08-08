import { QueryClientProvider } from '@tanstack/react-query';
import { type ErrorBoundaryProps } from 'expo-router';
import Stack from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';

import { FatalErrorScreen } from '@/components/feedback/fatal-error-screen';
import { RenderProfiler } from '@/components/performance/render-profiler';
import { queryClient } from '@/data/query/query-client';
import { RepositoryProvider } from '@/data/repositories/repository-provider';
import { AppInitializationGate } from '@/features/app-initialization/app-initialization-gate';
import { CloudBackupProvider } from '@/features/cloud-backup/cloud-backup-provider';
import { ObservabilityProvider } from '@/features/observability/observability-provider';
import { SettingsProvider } from '@/features/settings/settings-provider';
import { i18n } from '@/i18n';
import { crashReporter } from '@/services/observability/crash-reporter';
import { toAppError } from '@/services/observability/errors';
import { performanceMonitor } from '@/services/performance/performance-monitor';
import { AppThemeProvider } from '@/theme/theme-provider';

void SplashScreen.preventAutoHideAsync();
performanceMonitor.markStartup('root_module_loaded');

export function ErrorBoundary({ retry, error }: ErrorBoundaryProps) {
  void crashReporter.record(toAppError(error, 'app/initialization_failed'));
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
        <ObservabilityProvider>
          <AppThemeProvider>
            <QueryClientProvider client={queryClient}>
              <StatusBar style="auto" />
              <AppInitializationGate>
                <RepositoryProvider>
                  <CloudBackupProvider>
                    <RenderProfiler id="root_navigation">
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(onboarding)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="(flow)" />
                      </Stack>
                    </RenderProfiler>
                  </CloudBackupProvider>
                </RepositoryProvider>
              </AppInitializationGate>
            </QueryClientProvider>
          </AppThemeProvider>
        </ObservabilityProvider>
      </SettingsProvider>
    </I18nextProvider>
  );
}
