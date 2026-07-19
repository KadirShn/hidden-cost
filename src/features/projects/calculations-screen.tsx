import { type Href, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { VirtualizedScreen } from '@/components/layout/virtualized-screen';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { TextField } from '@/components/ui/text-field';
import { useProjects } from '@/data/query/project-hooks';
import { useSettings } from '@/features/settings/use-settings';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';
import { formatMinorCurrency } from '@/utils/format';

import { ProjectCard } from './project-card';

export function CalculationsScreen() {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const router = useRouter();
  const theme = useTheme();
  const { isOffline } = useNetworkStatus();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'draft' | 'complete' | 'archived'>('all');
  const projects = useProjects(filter === 'archived');
  const filtered = useMemo(
    () =>
      (projects.data ?? []).filter((project) => {
        const statusMatch = filter === 'all' || project.status === filter;
        return (
          statusMatch &&
          project.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
        );
      }),
    [filter, projects.data, query],
  );

  const controls = (
    <>
      {isOffline ? <OfflineBanner message={t('offline.projects')} /> : null}
      <Button label={t('calculations.action')} onPress={() => router.push('/templates' as Href)} />
      <TextField
        label={t('projects.searchLabel')}
        onChangeText={setQuery}
        returnKeyType="search"
        value={query}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {(['all', 'draft', 'complete', 'archived'] as const).map((value) => (
          <Chip
            key={value}
            label={t(`projects.filters.${value}`)}
            onPress={() => setFilter(value)}
            selected={filter === value}
          />
        ))}
      </View>
    </>
  );

  if (projects.isPending) {
    return (
      <Screen>
        {controls}
        <View accessible={false} style={{ gap: theme.spacing.md }}>
          <LoadingSkeleton accessibilityLabel={t('common.loading')} height={120} />
          <LoadingSkeleton accessibilityLabel={t('common.loading')} height={120} />
        </View>
      </Screen>
    );
  }

  if (projects.isError) {
    return (
      <Screen>
        {controls}
        <ErrorState
          message={t('projects.errorBody')}
          onRetry={() => void projects.refetch()}
          retryLabel={t('common.retry')}
          title={t('projects.errorTitle')}
        />
      </Screen>
    );
  }

  return (
    <VirtualizedScreen
      data={filtered}
      empty={
        <EmptyState message={t('calculations.emptyBody')} title={t('calculations.emptyTitle')} />
      }
      header={controls}
      keyExtractor={(project) => project.id}
      renderItem={({ item: project }) => (
        <ProjectCard
          amountLabel={formatMinorCurrency(project.purchasePriceMinor, project.currency, locale)}
          categoryLabel={t(`categories.${project.category}`)}
          onPress={() => router.push(`/project/${project.id}` as Href)}
          openLabel={t('common.open')}
          project={project}
          statusLabel={t(`projectStatus.${project.status}`)}
        />
      )}
      testID="calculations-list"
    />
  );
}
