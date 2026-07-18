import { type Href, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { useScenarioOverrides } from '@/data/query/scenario-hooks';
import type { ProjectBundle } from '@/data/repositories/types';
import { analyzeScenarios, type ScenarioAnalysis } from '@/domain';
import { useSettings } from '@/features/settings/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { formatMinorCurrency } from '@/utils/format';

import { getScenarioFields, scenarioPathLabelKey } from './scenario-form';

export function ScenarioSummaryView({
  analysis,
  currency,
  onEdit,
}: {
  analysis: ScenarioAnalysis;
  currency: string;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const theme = useTheme();
  const money = (value: string) => formatMinorCurrency(value, currency, locale);

  return (
    <Card>
      <AppText variant="subtitle">{t('scenarios.summaryTitle')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <MetricCard
          label={t('scenarios.low')}
          style={{ flex: 1, minWidth: 150 }}
          value={money(analysis.low.totalCostMinor)}
        />
        <MetricCard
          label={t('scenarios.base')}
          style={{ flex: 1, minWidth: 150 }}
          value={money(analysis.base.totalCostMinor)}
        />
        <MetricCard
          label={t('scenarios.high')}
          style={{ flex: 1, minWidth: 150 }}
          value={money(analysis.high.totalCostMinor)}
        />
      </View>
      <AppText selectable>
        {t('scenarios.range', {
          minimum: money(analysis.minimumTotalMinor),
          maximum: money(analysis.maximumTotalMinor),
          spread: money(analysis.spreadMinor),
        })}
      </AppText>
      {analysis.mostInfluential ? (
        <AppText selectable tone="accent">
          {t('scenarios.mostInfluential', {
            field: t(scenarioPathLabelKey(analysis.mostInfluential.path)),
            impact: money(analysis.mostInfluential.absoluteDeltaMinor),
          })}
        </AppText>
      ) : (
        <AppText selectable tone="secondary">
          {t('scenarios.noOverrides')}
        </AppText>
      )}
      <Button label={t('scenarios.edit')} onPress={onEdit} variant="secondary" />
    </Card>
  );
}

export function ScenarioSummary({ bundle }: { bundle: ProjectBundle }) {
  const router = useRouter();
  const overrides = useScenarioOverrides(bundle.project.id);
  const validPaths = new Set(getScenarioFields(bundle).map((field) => field.path));
  const analysis = analyzeScenarios(
    { project: bundle.project, costItems: bundle.costItems },
    (overrides.data ?? []).filter((record) => validPaths.has(record.path)),
  );
  return (
    <ScenarioSummaryView
      analysis={analysis}
      currency={bundle.project.currency}
      onEdit={() => router.push(`/scenario/${bundle.project.id}` as Href)}
    />
  );
}
