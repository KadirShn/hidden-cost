import { type Href, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useCreateProject } from '@/data/query/project-hooks';
import { useTemplate } from '@/data/query/template-hooks';
import { createProjectDraft } from '@/features/calculation-wizard/form-mapper';
import { telemetry } from '@/services/observability/telemetry-service';

export function TemplateDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const template = useTemplate(id);
  const createProject = useCreateProject();

  useEffect(() => {
    if (template.data) {
      void telemetry.track('template_viewed', { source_screen: 'template_detail' });
    }
  }, [template.data]);

  if (template.isPending) {
    return (
      <Screen>
        <LoadingSkeleton accessibilityLabel={t('common.loading')} height={180} />
      </Screen>
    );
  }
  if (template.isError || !template.data) {
    return (
      <Screen>
        <ErrorState
          message={t('templatesScreen.detailErrorBody')}
          onRetry={() => void template.refetch()}
          retryLabel={t('common.retry')}
          title={t('templatesScreen.detailErrorTitle')}
        />
      </Screen>
    );
  }

  const data = template.data;
  const start = async () => {
    void telemetry.track('calculation_started', { source_screen: 'template_detail' });
    const created = await createProject.mutateAsync({
      project: createProjectDraft(data, t(data.titleKey)),
    });
    router.replace(`/wizard/${created.project.id}` as Href);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: t(data.titleKey) }} />
      <AppText variant="title">{t(data.titleKey)}</AppText>
      <AppText selectable tone="secondary">
        {t(data.descriptionKey)}
      </AppText>
      <Card>
        <AppText variant="subtitle">{t('templatesScreen.includedTitle')}</AppText>
        {data.recommendedItems.map((item) => (
          <AppText key={item.key} selectable>
            • {t(`costItems.${item.key}`, { defaultValue: item.key })}
          </AppText>
        ))}
      </Card>
      <Card>
        <AppText variant="subtitle">{t('templatesScreen.defaultsTitle')}</AppText>
        <AppText selectable tone="secondary">
          {t('templatesScreen.defaultsBody', {
            months: data.defaultOwnershipMonths,
            currency: data.defaultCurrency,
          })}
        </AppText>
      </Card>
      <Button
        fullWidth
        label={t('templatesScreen.start')}
        loading={createProject.isPending}
        onPress={() => void start()}
      />
      {createProject.isError ? (
        <AppText accessibilityLiveRegion="assertive" tone="danger">
          {t('templatesScreen.createError')}
        </AppText>
      ) : null}
    </Screen>
  );
}
