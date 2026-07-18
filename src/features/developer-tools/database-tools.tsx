import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DevSettings, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  DEVELOPMENT_RESET_CONFIRMATION,
  isDatabaseResetAvailable,
  resetDatabaseForDevelopment,
} from '@/data/database/client';
import { queryClient } from '@/data/query/query-client';
import { useTheme } from '@/hooks/use-theme';

export function DeveloperDatabaseTools() {
  const [confirming, setConfirming] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();

  if (!isDatabaseResetAvailable()) return null;

  const reset = () => {
    setConfirming(false);
    resetDatabaseForDevelopment(DEVELOPMENT_RESET_CONFIRMATION);
    queryClient.clear();
    DevSettings.reload('Hidden Cost database reset');
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="subtitle">{t('settings.developerSection')}</AppText>
      <Card>
        <AppText variant="label">{t('settings.resetDatabaseTitle')}</AppText>
        <AppText tone="secondary">{t('settings.resetDatabaseHelp')}</AppText>
        <Button
          accessibilityHint={t('settings.resetDatabaseHelp')}
          label={t('settings.resetDatabaseAction')}
          onPress={() => setConfirming(true)}
          variant="danger"
        />
      </Card>
      <ConfirmDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('settings.resetDatabaseConfirm')}
        destructive
        message={t('settings.resetDatabaseMessage')}
        onCancel={() => setConfirming(false)}
        onConfirm={reset}
        title={t('settings.resetDatabaseTitle')}
        visible={confirming}
      />
    </View>
  );
}
