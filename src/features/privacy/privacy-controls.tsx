import { type Href, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Divider } from '@/components/ui/divider';
import { queryClient } from '@/data/query/query-client';
import { useRepositories } from '@/data/repositories/repository-provider';
import { useTheme } from '@/hooks/use-theme';
import { exportLocalData } from '@/services/privacy/local-data-exporter';

export function PrivacyControls() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const repositories = useRepositories();
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [status, setStatus] = useState<'exported' | 'deleted' | 'error' | null>(null);

  const exportData = async () => {
    setBusy('export');
    setStatus(null);
    try {
      const outcome = await exportLocalData(repositories.localData.exportSnapshot());
      setStatus(outcome === 'unavailable' ? 'error' : 'exported');
    } catch {
      setStatus('error');
    } finally {
      setBusy(null);
    }
  };
  const deleteData = async () => {
    setConfirmDelete(false);
    setBusy('delete');
    setStatus(null);
    try {
      repositories.localData.deleteAll();
      queryClient.clear();
      setStatus('deleted');
    } catch {
      setStatus('error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="subtitle">{t('privacy.section')}</AppText>
      <Card>
        <AppText variant="label">{t('privacy.localDataTitle')}</AppText>
        <AppText selectable tone="secondary">
          {t('privacy.localDataBody')}
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
          <Button
            label={t('privacy.exportAction')}
            loading={busy === 'export'}
            onPress={() => void exportData()}
            variant="secondary"
          />
          <Button
            label={t('privacy.deleteAction')}
            loading={busy === 'delete'}
            onPress={() => setConfirmDelete(true)}
            variant="danger"
          />
        </View>
        {status ? (
          <AppText
            accessibilityLiveRegion={status === 'error' ? 'assertive' : 'polite'}
            tone={status === 'error' ? 'danger' : 'success'}
          >
            {t(`privacy.status.${status}`)}
          </AppText>
        ) : null}
        <Divider />
        <AppText variant="label">{t('legal.section')}</AppText>
        <View style={{ gap: theme.spacing.sm }}>
          <Button
            fullWidth
            label={t('legal.privacyTitle')}
            onPress={() => router.push('/legal/privacy' as Href)}
            variant="secondary"
          />
          <Button
            fullWidth
            label={t('legal.termsTitle')}
            onPress={() => router.push('/legal/terms' as Href)}
            variant="secondary"
          />
          <Button
            fullWidth
            label={t('legal.disclaimerTitle')}
            onPress={() => router.push('/legal/disclaimer' as Href)}
            variant="secondary"
          />
        </View>
      </Card>
      <ConfirmDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('privacy.deleteConfirm')}
        destructive
        message={t('privacy.deleteMessage')}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => void deleteData()}
        title={t('privacy.deleteTitle')}
        visible={confirmDelete}
      />
    </View>
  );
}
