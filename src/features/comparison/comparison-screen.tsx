import { Decimal } from 'decimal.js';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { NumberInput } from '@/components/ui/number-input';
import { useProjectBundles, useProjects } from '@/data/query/project-hooks';
import { calculateCostProject, compareProjects, type ComparisonEntry } from '@/domain';
import { ComparisonExportActions } from '@/features/export/comparison-export-actions';
import { useSettings } from '@/features/settings/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { projectCountBucket } from '@/services/observability/analytics-contracts';
import { telemetry } from '@/services/observability/telemetry-service';
import { formatMinorCurrency, parseLocalizedNumber } from '@/utils/format';

function ComparisonBar({
  label,
  value,
  width,
  showBar = true,
}: {
  label: string;
  value: string;
  width: number;
  showBar?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          justifyContent: 'space-between',
        }}
      >
        <AppText variant="label">{label}</AppText>
        <AppText selectable variant="label">
          {value}
        </AppText>
      </View>
      {showBar ? (
        <View
          accessible
          accessibilityLabel={t('comparison.barAccessible', { label, value })}
          accessibilityRole="image"
          style={{
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.pill,
            height: 14,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.chartRecurring,
              height: '100%',
              width: `${width}%`,
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

export function ComparisonResults({
  entries,
  normalizeMonths,
}: {
  entries: ComparisonEntry[];
  normalizeMonths?: number;
}) {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const theme = useTheme();
  const comparison = compareProjects(entries, { normalizeToMonths: normalizeMonths });
  const sameCurrency = !comparison.warnings.includes('different_currencies');
  const currency = entries[0].project.currency;
  const maxTotal = sameCurrency
    ? Decimal.max(...entries.map(({ result }) => result.totalCostMinor))
    : new Decimal(1);

  return (
    <View style={{ gap: theme.spacing.xl }}>
      {comparison.warnings.map((warning) => (
        <Card key={warning} style={{ borderColor: theme.colors.warning }}>
          <AppText selectable tone="warning">
            {t(`comparison.warnings.${warning}`)}
          </AppText>
        </Card>
      ))}
      <Card>
        <AppText variant="subtitle">{t('comparison.totalTitle')}</AppText>
        {entries.map(({ project, result }) => (
          <ComparisonBar
            key={project.id}
            label={project.title}
            value={`${formatMinorCurrency(result.totalCostMinor, project.currency, locale)}${
              comparison.lowestTotalProjectIds.includes(project.id)
                ? ` · ${t('comparison.lowest')}`
                : ''
            }`}
            width={
              sameCurrency
                ? new Decimal(result.totalCostMinor).dividedBy(maxTotal).times(100).toNumber()
                : 100
            }
            showBar={sameCurrency}
          />
        ))}
      </Card>
      <Card>
        <AppText variant="subtitle">{t('comparison.monthlyTitle')}</AppText>
        {entries.map(({ project, result }) => (
          <AppText key={project.id} selectable>
            {project.title}:{' '}
            {formatMinorCurrency(result.monthlyCostMinor, project.currency, locale)}
            {comparison.lowestMonthlyProjectIds.includes(project.id)
              ? ` · ${t('comparison.lowest')}`
              : ''}
          </AppText>
        ))}
      </Card>
      {comparison.normalizedTotals ? (
        <Card>
          <AppText variant="subtitle">
            {t('comparison.normalizedTitle', { months: normalizeMonths })}
          </AppText>
          {comparison.normalizedTotals.map((item) => {
            const project = entries.find((entry) => entry.project.id === item.projectId)!.project;
            return (
              <AppText key={item.projectId} selectable>
                {project.title}: {formatMinorCurrency(item.valueMinor, currency, locale)}
              </AppText>
            );
          })}
        </Card>
      ) : null}
      {!comparison.warnings.includes('incompatible_usage_units') ? (
        <Card>
          <AppText variant="subtitle">{t('comparison.usageTitle')}</AppText>
          {entries.map(({ project, result }) => (
            <AppText key={project.id} selectable>
              {project.title}:{' '}
              {formatMinorCurrency(result.costPerUsageMinor!, project.currency, locale)} /{' '}
              {project.usageUnit}
              {comparison.lowestUsageCostProjectIds.includes(project.id)
                ? ` · ${t('comparison.lowest')}`
                : ''}
            </AppText>
          ))}
        </Card>
      ) : null}
      <Card>
        <AppText variant="subtitle">{t('comparison.assumptionsTitle')}</AppText>
        {entries.map(({ project }) => (
          <AppText key={project.id} selectable>
            {t('comparison.assumptionLine', {
              title: project.title,
              months: project.ownershipMonths,
              usage: project.usagePerMonth ?? 0,
              unit: project.usageUnit ?? '-',
              currency: project.currency,
            })}
          </AppText>
        ))}
      </Card>
      <ComparisonExportActions entries={entries} />
    </View>
  );
}

export function ComparisonScreen() {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const theme = useTheme();
  const projects = useProjects();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [limitMessage, setLimitMessage] = useState(false);
  const [normalize, setNormalize] = useState(false);
  const [normalizeMonthsText, setNormalizeMonthsText] = useState('36');
  const lastComparisonKey = useRef('');
  const bundles = useProjectBundles(selectedIds);
  const available = (projects.data ?? []).filter((project) => project.status === 'complete');
  const entries = bundles
    .map(({ data }) => data)
    .filter((bundle): bundle is NonNullable<typeof bundle> => Boolean(bundle))
    .map((bundle) => ({
      project: bundle.project,
      result: calculateCostProject({ project: bundle.project, costItems: bundle.costItems }),
    }));
  const parsedMonths = parseLocalizedNumber(normalizeMonthsText, locale);
  const normalizeMonths =
    normalize && parsedMonths && Number.isInteger(parsedMonths) && parsedMonths > 0
      ? parsedMonths
      : undefined;
  useEffect(() => {
    if (selectedIds.length < 2) return;
    const key = [...selectedIds].sort().join(':');
    if (lastComparisonKey.current === key || entries.length !== selectedIds.length) return;
    lastComparisonKey.current = key;
    void telemetry.track('comparison_started', {
      project_count_bucket: projectCountBucket(selectedIds.length),
      source_screen: 'compare',
    });
    void telemetry.track('comparison_completed', {
      project_count_bucket: projectCountBucket(entries.length),
      source_screen: 'compare',
    });
  }, [entries.length, selectedIds]);
  const toggleProject = (projectId: string) => {
    if (selectedIds.includes(projectId)) {
      setSelectedIds((ids) => ids.filter((id) => id !== projectId));
      setLimitMessage(false);
      return;
    }
    if (selectedIds.length === 3) {
      setLimitMessage(true);
      return;
    }
    setSelectedIds((ids) => [...ids, projectId]);
  };

  if (projects.isPending)
    return (
      <Screen>
        <LoadingSkeleton accessibilityLabel={t('common.loading')} height={260} />
      </Screen>
    );
  if (projects.isError)
    return (
      <Screen>
        <ErrorState
          message={t('projects.errorBody')}
          onRetry={() => void projects.refetch()}
          retryLabel={t('common.retry')}
          title={t('projects.errorTitle')}
        />
      </Screen>
    );

  return (
    <Screen>
      <AppText selectable tone="secondary">
        {t('comparison.body')}
      </AppText>
      {available.length ? (
        available.map((project) => (
          <Card key={project.id}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.md,
              }}
            >
              <View style={{ flex: 1, minWidth: 180 }}>
                <AppText variant="subtitle">{project.title}</AppText>
                <AppText tone="secondary">
                  {formatMinorCurrency(project.purchasePriceMinor, project.currency, locale)}
                </AppText>
              </View>
              <Chip
                label={
                  selectedIds.includes(project.id) ? t('comparison.remove') : t('comparison.add')
                }
                onPress={() => toggleProject(project.id)}
                selected={selectedIds.includes(project.id)}
              />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState message={t('compare.emptyBody')} title={t('compare.emptyTitle')} />
      )}
      {limitMessage ? (
        <AppText accessibilityLiveRegion="assertive" tone="warning">
          {t('comparison.limit')}
        </AppText>
      ) : null}
      {selectedIds.length >= 2 ? (
        <>
          <Card>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing.md }}>
              <View style={{ flex: 1 }}>
                <AppText variant="label">{t('comparison.normalize')}</AppText>
                <AppText selectable variant="helper" tone="secondary">
                  {t('comparison.normalizeHelp')}
                </AppText>
              </View>
              <Switch
                accessibilityLabel={t('comparison.normalize')}
                onValueChange={setNormalize}
                value={normalize}
              />
            </View>
            {normalize ? (
              <NumberInput
                errorText={normalizeMonths ? undefined : t('forms.invalidNumber')}
                label={t('comparison.normalizeMonths')}
                onChangeText={setNormalizeMonthsText}
                value={normalizeMonthsText}
              />
            ) : null}
          </Card>
          {bundles.some((query) => query.isPending) ? (
            <LoadingSkeleton accessibilityLabel={t('common.loading')} height={260} />
          ) : entries.length >= 2 ? (
            <ComparisonResults entries={entries} normalizeMonths={normalizeMonths} />
          ) : (
            <ErrorState
              message={t('comparison.loadErrorBody')}
              onRetry={() => bundles.forEach((query) => void query.refetch())}
              retryLabel={t('common.retry')}
              title={t('comparison.loadErrorTitle')}
            />
          )}
        </>
      ) : null}
    </Screen>
  );
}
