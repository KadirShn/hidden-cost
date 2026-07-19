import { type Href, Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { VirtualizedScreen } from '@/components/layout/virtualized-screen';
import { AppText } from '@/components/ui/app-text';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { TextField } from '@/components/ui/text-field';
import { useTemplates } from '@/data/query/template-hooks';
import { NativeAdSlot } from '@/features/ads/native-ad-slot';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useTheme } from '@/hooks/use-theme';

import { TemplateCard } from './template-card';

export function TemplateLibraryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { isOffline } = useNetworkStatus();
  const templates = useTemplates();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const filtered = useMemo(
    () =>
      (templates.data ?? []).filter((template) => {
        const matchesCategory = category === 'all' || template.category === category;
        const search = query.trim().toLocaleLowerCase();
        const matchesSearch =
          !search ||
          t(template.titleKey).toLocaleLowerCase().includes(search) ||
          t(template.descriptionKey).toLocaleLowerCase().includes(search);
        return matchesCategory && matchesSearch;
      }),
    [category, query, t, templates.data],
  );

  const controls = (
    <>
      <Stack.Screen options={{ title: t('templatesScreen.title') }} />
      {isOffline ? <OfflineBanner message={t('offline.templates')} /> : null}
      <AppText selectable tone="secondary">
        {t('templatesScreen.body')}
      </AppText>
      <TextField
        accessibilityHint={t('templatesScreen.searchHint')}
        label={t('templatesScreen.searchLabel')}
        onChangeText={setQuery}
        returnKeyType="search"
        value={query}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
        {['all', 'motorcycle', 'car', 'boat', 'electronics', 'subscription', 'custom'].map(
          (value) => (
            <Chip
              key={value}
              label={value === 'all' ? t('common.all') : t(`categories.${value}`)}
              onPress={() => setCategory(value)}
              selected={category === value}
            />
          ),
        )}
      </View>
    </>
  );

  if (templates.isPending) {
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

  if (templates.isError) {
    return (
      <Screen>
        {controls}
        <ErrorState
          message={t('templatesScreen.errorBody')}
          onRetry={() => void templates.refetch()}
          retryLabel={t('common.retry')}
          title={t('templatesScreen.errorTitle')}
        />
      </Screen>
    );
  }

  return (
    <VirtualizedScreen
      data={filtered}
      empty={
        <EmptyState
          message={t('templatesScreen.emptyBody')}
          title={t('templatesScreen.emptyTitle')}
        />
      }
      footer={filtered.length ? <NativeAdSlot hasContent placement="template_library" /> : null}
      header={controls}
      keyExtractor={(template) => template.id}
      renderItem={({ item: template }) => (
        <TemplateCard
          description={t(template.descriptionKey)}
          openLabel={t('common.open')}
          onPress={() => router.push(`/templates/${template.id}` as Href)}
          template={template}
          title={t(template.titleKey)}
        />
      )}
      testID="template-list"
    />
  );
}
