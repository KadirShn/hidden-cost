import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { runtimeConfig } from '@/config/runtime-config';
import { useTheme } from '@/hooks/use-theme';
import { crashReporter } from '@/services/observability/crash-reporter';
import { telemetry } from '@/services/observability/telemetry-service';

export function DeveloperObservabilityTools() {
  const { t } = useTranslation();
  const theme = useTheme();
  const [status, setStatus] = useState(false);

  if (!__DEV__ || runtimeConfig.appEnvironment !== 'development') return null;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="subtitle">{t('observability.developerTitle')}</AppText>
      <Card>
        <AppText tone="secondary">{t('observability.developerBody')}</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <Button
            label={t('observability.testAnalytics')}
            onPress={() => {
              void telemetry.track('app_opened', { source_screen: 'dev_tools' });
              setStatus(true);
            }}
            variant="secondary"
          />
          <Button
            label={t('observability.testCrash')}
            onPress={() => void crashReporter.recordDevelopmentTest().then(setStatus)}
            variant="secondary"
          />
        </View>
        {status ? <AppText tone="success">{t('observability.testQueued')}</AppText> : null}
      </Card>
    </View>
  );
}
