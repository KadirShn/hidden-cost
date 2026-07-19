import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { runtimeConfig } from '@/config/runtime-config';
import { performanceMonitor } from '@/services/performance/performance-monitor';
import type { PerformanceSample } from '@/services/performance/performance-monitor';

export function DeveloperPerformanceTools() {
  const { t } = useTranslation();
  const [samples, setSamples] = useState<readonly PerformanceSample[]>([]);

  if (!__DEV__ || runtimeConfig.appEnvironment !== 'development') return null;

  return (
    <Card>
      <AppText variant="subtitle">{t('performance.developerTitle')}</AppText>
      <AppText selectable tone="secondary">
        {t('performance.developerBody')}
      </AppText>
      <Button
        label={t('performance.refresh')}
        onPress={() => setSamples(performanceMonitor.snapshot().samples.slice(-10))}
        variant="secondary"
      />
      {samples.map((sample, index) => (
        <AppText key={`${sample.name}-${sample.recordedAt}-${index}`} selectable variant="helper">
          {sample.name}: {sample.durationMs.toFixed(1)} ms
        </AppText>
      ))}
    </Card>
  );
}
