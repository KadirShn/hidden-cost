import { type Href, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { BrandLockup } from '@/components/branding/brand-lockup';
import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { useProjects } from '@/data/query/project-hooks';
import { useTemplates } from '@/data/query/template-hooks';
import { NativeAdSlot } from '@/features/ads/native-ad-slot';
import { ProjectCard } from '@/features/projects/project-card';
import { useSettings } from '@/features/settings/use-settings';
import { TemplateCard } from '@/features/templates/template-card';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';
import { formatMinorCurrency } from '@/utils/format';

export function DashboardScreen() {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const router = useRouter();
  const theme = useTheme();
  const { isOffline } = useNetworkStatus();
  const projects = useProjects();
  const templates = useTemplates();

  return (
    <Screen testID="dashboard-screen">
      {isOffline ? <OfflineBanner message={t('offline.message')} /> : null}
      <BrandLockup name={t('brand.name')} tagline={t('brand.tagline')} />
      <Card elevated style={{ backgroundColor: theme.colors.surfaceElevated }}>
        <AppText selectable variant="title">
          {t('home.greeting')}
        </AppText>
        <AppText selectable tone="secondary">
          {t('home.body')}
        </AppText>
        <Button
          label={t('home.newCalculation')}
          onPress={() => router.push('/templates' as Href)}
          testID="home-new-calculation"
        />
      </Card>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="subtitle">{t('home.recentTitle')}</AppText>
        {projects.isPending ? (
          <LoadingSkeleton accessibilityLabel={t('common.loading')} height={112} />
        ) : projects.isError ? (
          <ErrorState
            message={t('projects.errorBody')}
            onRetry={() => void projects.refetch()}
            retryLabel={t('common.retry')}
            title={t('projects.errorTitle')}
          />
        ) : projects.data?.length ? (
          projects.data
            .slice(0, 3)
            .map((project) => (
              <ProjectCard
                key={project.id}
                amountCaption={t('home.purchasePrice')}
                amountLabel={formatMinorCurrency(
                  project.purchasePriceMinor,
                  project.currency,
                  locale,
                )}
                categoryLabel={t(`categories.${project.category}`)}
                onPress={() => router.push(`/project/${project.id}` as Href)}
                openLabel={t('common.open')}
                project={project}
                statusLabel={t(`projectStatus.${project.status}`)}
              />
            ))
        ) : (
          <EmptyState message={t('home.recentEmptyBody')} title={t('home.recentEmptyTitle')} />
        )}
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppText variant="subtitle">{t('home.categoriesTitle')}</AppText>
        {templates.isPending ? (
          <LoadingSkeleton accessibilityLabel={t('common.loading')} height={112} />
        ) : templates.isError ? (
          <ErrorState
            message={t('templatesScreen.errorBody')}
            onRetry={() => void templates.refetch()}
            retryLabel={t('common.retry')}
            title={t('templatesScreen.errorTitle')}
          />
        ) : (
          templates.data
            ?.slice(0, 3)
            .map((template) => (
              <TemplateCard
                key={template.id}
                description={t(template.descriptionKey)}
                openLabel={t('common.open')}
                onPress={() => router.push(`/templates/${template.id}` as Href)}
                template={template}
                title={t(template.titleKey)}
              />
            ))
        )}
        <Button
          label={t('home.allTemplates')}
          onPress={() => router.push('/templates' as Href)}
          variant="secondary"
        />
      </View>

      <Card>
        <AppText variant="label" tone="accent">
          {t('home.insightLabel')}
        </AppText>
        <AppText selectable>{t('home.insight')}</AppText>
      </Card>

      <NativeAdSlot
        hasContent={Boolean(templates.data?.length || projects.data?.length)}
        placement="dashboard"
      />
    </Screen>
  );
}
