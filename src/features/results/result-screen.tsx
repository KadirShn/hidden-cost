import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useProject, useUpdateProject } from '@/data/query/project-hooks';
import { calculateCostProject } from '@/domain';
import { ProjectExportActions } from '@/features/export/project-export-actions';
import { ScenarioSummary } from '@/features/scenarios/scenario-summary';
import { useTheme } from '@/hooks/use-theme';
import { telemetry } from '@/services/observability/telemetry-service';

import { ResultSummary } from './result-summary';

export function ResultScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const project = useProject(id);
  const updateProject = useUpdateProject(id);

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
  const save = async () => {
    await updateProject.mutateAsync({ ...bundle.project, status: 'complete' });
    void telemetry.track('project_saved', { source_screen: 'result' });
    router.replace(`/project/${id}?completed=1` as Href);
  };

  return (
    <Screen testID="result-screen">
      <Stack.Screen options={{ title: t('result.title') }} />
      <AppText variant="title">{bundle.project.title}</AppText>
      <ResultSummary result={result} />
      <ScenarioSummary bundle={bundle} />
      <ProjectExportActions bundle={bundle} />
      {updateProject.isError ? (
        <AppText accessibilityLiveRegion="assertive" tone="danger">
          {t('result.saveError')}
        </AppText>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <Button
          label={t('result.edit')}
          onPress={() => router.push(`/wizard/${id}` as Href)}
          variant="secondary"
        />
        {bundle.project.status === 'complete' ? (
          <Button
            label={t('result.openProject')}
            onPress={() => router.replace(`/project/${id}` as Href)}
          />
        ) : (
          <Button
            label={t('result.save')}
            loading={updateProject.isPending}
            onPress={() => void save()}
            testID="result-save"
          />
        )}
      </View>
    </Screen>
  );
}
