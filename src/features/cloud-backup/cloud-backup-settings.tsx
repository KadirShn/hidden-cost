import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Divider } from '@/components/ui/divider';
import { useSettings } from '@/features/settings/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { getLocaleTag } from '@/utils/format';

import { useCloudBackup } from './use-cloud-backup';

export function CloudBackupSettings() {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const theme = useTheme();
  const cloud = useCloudBackup();
  const [deleteVisible, setDeleteVisible] = useState(false);
  const busy = cloud.status === 'connecting' || cloud.status === 'syncing';
  const lastSync = cloud.lastSyncAt
    ? new Intl.DateTimeFormat(getLocaleTag(locale), {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(cloud.lastSyncAt))
    : t('cloudBackup.neverSynced');

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="subtitle">{t('cloudBackup.section')}</AppText>
      <Card>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
          }}
        >
          <View style={{ flex: 1, minWidth: 220 }}>
            <AppText variant="label">{t('cloudBackup.title')}</AppText>
            <AppText selectable tone="secondary">
              {t('cloudBackup.description')}
            </AppText>
          </View>
          <Switch
            accessibilityLabel={t('cloudBackup.title')}
            disabled={busy || !cloud.configured}
            onValueChange={(value) => void cloud.setEnabled(value)}
            value={cloud.enabled}
          />
        </View>
        {!cloud.configured ? (
          <AppText selectable tone="warning">
            {t('cloudBackup.unavailable')}
          </AppText>
        ) : null}
        <Divider />
        <AppText accessibilityLiveRegion="polite" selectable>
          {t(`cloudBackup.status.${cloud.status}`, { count: cloud.summary.pending })}
        </AppText>
        <AppText selectable variant="helper" tone="secondary">
          {t('cloudBackup.lastSync', { date: lastSync })}
        </AppText>
        {cloud.errorCode ? (
          <AppText accessibilityLiveRegion="assertive" selectable tone="danger">
            {t('cloudBackup.error')}
          </AppText>
        ) : null}
        {cloud.enabled ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
            <Button
              disabled={busy}
              label={t('cloudBackup.syncNow')}
              loading={cloud.status === 'syncing'}
              onPress={() => void cloud.syncNow()}
              variant="secondary"
            />
            {cloud.user?.isAnonymous && cloud.googleLinkAvailable ? (
              <View style={{ gap: theme.spacing.sm }}>
                <Button
                  disabled={busy}
                  label={t('cloudBackup.linkGoogle')}
                  onPress={() => void cloud.linkGoogle()}
                  variant="secondary"
                />
                {cloud.googleLinkError ? (
                  <AppText accessibilityLiveRegion="assertive" selectable tone="danger">
                    {t(`cloudBackup.googleLinkErrors.${cloud.googleLinkError}`)}
                  </AppText>
                ) : null}
                {cloud.googleLinkDiagnosticCode ? (
                  <AppText selectable variant="helper" tone="secondary">
                    {t('cloudBackup.googleLinkDiagnostic', {
                      code: cloud.googleLinkDiagnosticCode,
                    })}
                  </AppText>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}
        {cloud.user ? (
          <>
            <Divider />
            <AppText selectable variant="helper" tone="secondary">
              {cloud.user.isAnonymous
                ? t('cloudBackup.anonymousAccount')
                : t('cloudBackup.linkedAccount', {
                    account: cloud.user.email ?? cloud.user.displayName ?? t('cloudBackup.google'),
                  })}
            </AppText>
            <Button
              disabled={busy}
              label={t('cloudBackup.deleteCloudAccount')}
              onPress={() => setDeleteVisible(true)}
              variant="danger"
            />
          </>
        ) : null}
      </Card>
      <ConfirmDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('cloudBackup.deleteConfirm')}
        destructive
        message={t('cloudBackup.deleteMessage')}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={() => {
          setDeleteVisible(false);
          void cloud.deleteCloudAccount();
        }}
        title={t('cloudBackup.deleteTitle')}
        visible={deleteVisible}
      />
    </View>
  );
}
