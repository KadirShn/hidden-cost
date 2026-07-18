import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import {
  useArchiveProject,
  useDuplicateProject,
  useProject,
  useSoftDeleteProject,
} from '@/data/query/project-hooks';
import { calculateCostProject } from '@/domain';
import { ResultSummary } from '@/features/results/result-summary';
import { useTheme } from '@/hooks/use-theme';

type ConfirmAction = 'archive' | 'delete' | null;

export function ProjectDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const project = useProject(id);
  const duplicate = useDuplicateProject();
  const archive = useArchiveProject();
  const remove = useSoftDeleteProject();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  if (project.isPending) {
    return (
      <Screen>
        <LoadingSkeleton accessibilityLabel={t('common.loading')} height={300} />
      </Screen>
    );
  }
  if (project.isError || !project.data) {
    return (
      <Screen>
        <ErrorState
          message={t('projects.notFoundBody')}
          onRetry={() => void project.refetch()}
          retryLabel={t('common.retry')}
          title={t('projects.notFoundTitle')}
        />
      </Screen>
    );
  }

  const bundle = project.data;
  const result = calculateCostProject({ project: bundle.project, costItems: bundle.costItems });
  const duplicateProject = async () => {
    const copy = await duplicate.mutateAsync({
      projectId: id,
      title: t('projects.copyTitle', { title: bundle.project.title }),
    });
    router.push(`/project/${copy.project.id}` as Href);
  };
  const confirm = async () => {
    if (confirmAction === 'archive') await archive.mutateAsync(id);
    if (confirmAction === 'delete') await remove.mutateAsync(id);
    setConfirmAction(null);
    router.replace('/calculations' as Href);
  };
  const actionError = duplicate.isError || archive.isError || remove.isError;

  return (
    <Screen>
      <Stack.Screen options={{ title: bundle.project.title }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        <Chip disabled label={t(`categories.${bundle.project.category}`)} />
        <Chip
          disabled
          label={t(`projectStatus.${bundle.project.status}`)}
          selected={bundle.project.status === 'complete'}
        />
      </View>
      <ResultSummary result={result} />
      {actionError ? (
        <AppText accessibilityLiveRegion="assertive" tone="danger">
          {t('projects.actionError')}
        </AppText>
      ) : null}
      <View style={{ gap: theme.spacing.md }}>
        <Button
          fullWidth
          label={t('projects.edit')}
          onPress={() => router.push(`/wizard/${id}` as Href)}
        />
        <Button
          fullWidth
          label={t('projects.duplicate')}
          loading={duplicate.isPending}
          onPress={() => void duplicateProject()}
          variant="secondary"
        />
        {bundle.project.status !== 'archived' ? (
          <Button
            fullWidth
            label={t('projects.archive')}
            onPress={() => setConfirmAction('archive')}
            variant="secondary"
          />
        ) : null}
        <Button
          fullWidth
          label={t('projects.delete')}
          onPress={() => setConfirmAction('delete')}
          variant="danger"
        />
      </View>
      <ConfirmDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={confirmAction === 'delete' ? t('projects.delete') : t('projects.archive')}
        destructive={confirmAction === 'delete'}
        message={confirmAction === 'delete' ? t('projects.deleteBody') : t('projects.archiveBody')}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void confirm()}
        title={confirmAction === 'delete' ? t('projects.deleteTitle') : t('projects.archiveTitle')}
        visible={confirmAction !== null}
      />
    </Screen>
  );
}
