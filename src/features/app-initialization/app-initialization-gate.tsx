import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FatalErrorScreen } from '@/components/feedback/fatal-error-screen';
import { InitializationScreen } from '@/components/feedback/initialization-screen';
import { useAppInitialization } from '@/features/app-initialization/use-app-initialization';
import { performanceMonitor } from '@/services/performance/performance-monitor';

import type { PropsWithChildren } from 'react';

export function AppInitializationGate({ children }: PropsWithChildren) {
  const { state, retry } = useAppInitialization();
  const { t } = useTranslation();

  useEffect(() => {
    if (state.status !== 'initializing') {
      performanceMonitor.markStartup('ui_ready');
      performanceMonitor.measureStartupFromMark('ui_ready', 'root_module_loaded');
      void SplashScreen.hideAsync();
    }
  }, [state.status]);

  if (state.status === 'initializing')
    return <InitializationScreen label={t('app.initializing')} />;
  if (state.status === 'error') {
    const isDatabaseFailure = state.kind === 'database';
    return (
      <FatalErrorScreen
        actionLabel={t('common.retry')}
        message={t(isDatabaseFailure ? 'app.databaseFailureMessage' : 'app.fatalMessage')}
        onRetry={retry}
        title={t(isDatabaseFailure ? 'app.databaseFailureTitle' : 'app.fatalTitle')}
      />
    );
  }

  return children;
}
