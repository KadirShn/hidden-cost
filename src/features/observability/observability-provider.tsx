import { useEffect, useRef, type PropsWithChildren } from 'react';

import { useSettings } from '@/features/settings/use-settings';
import { initializeAppProtection } from '@/services/observability/app-protection';
import { crashReporter } from '@/services/observability/crash-reporter';
import { logger } from '@/services/observability/logger';
import { telemetry } from '@/services/observability/telemetry-service';

export function ObservabilityProvider({ children }: PropsWithChildren) {
  const { analyticsConsent, locale } = useSettings();
  const appOpenTracked = useRef(false);

  useEffect(() => {
    void crashReporter.initialize();
    void initializeAppProtection().catch(() => {
      logger.write('warn', 'app_check/initialization_failed', { operation: 'initialize' });
    });
  }, []);

  useEffect(() => {
    const configure = async () => {
      await telemetry.setConsent(analyticsConsent);
      if (analyticsConsent && !appOpenTracked.current) {
        appOpenTracked.current = true;
        await telemetry.track('app_opened', { locale, source_screen: 'app' });
      }
    };
    void configure();
  }, [analyticsConsent, locale]);

  return children;
}
