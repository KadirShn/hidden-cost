import Constants from 'expo-constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { useScenarioOverrides } from '@/data/query/scenario-hooks';
import type { ProjectBundle } from '@/data/repositories/types';
import { analyzeScenarios } from '@/domain';
import { getScenarioFields } from '@/features/scenarios/scenario-form';
import { useSettings } from '@/features/settings/use-settings';
import { useTheme } from '@/hooks/use-theme';
import type { ExportOutcome } from '@/services/export/document-exporter';
import { documentExporter } from '@/services/export/expo-document-exporter';
import {
  buildProjectReportHtml,
  buildResultCardHtml,
  type ProjectReportViewModel,
  type ResultCardViewModel,
} from '@/services/export/report-html';
import { formatMinorCurrency, formatNumber, getLocaleTag } from '@/utils/format';

export function ProjectExportActions({ bundle }: { bundle: ProjectBundle }) {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const theme = useTheme();
  const overrides = useScenarioOverrides(bundle.project.id);
  const [busy, setBusy] = useState<'pdf' | 'card' | null>(null);
  const [error, setError] = useState(false);
  const [outcome, setOutcome] = useState<ExportOutcome | null>(null);
  const validScenarioPaths = new Set(getScenarioFields(bundle).map((field) => field.path));
  const analysis = analyzeScenarios(
    { project: bundle.project, costItems: bundle.costItems },
    (overrides.data ?? []).filter((record) => validScenarioPaths.has(record.path)),
  );
  const result = analysis.base;
  const money = (value: string) => formatMinorCurrency(value, result.currency, locale);
  const generatedAt = new Intl.DateTimeFormat(getLocaleTag(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  const projectModel = (): ProjectReportViewModel => ({
    documentTitle: t('export.projectReportTitle'),
    projectTitle: bundle.project.title,
    generatedAtLabel: t('export.generatedAt', { date: generatedAt }),
    categoryLabel: t('export.category'),
    category: t(`categories.${bundle.project.category}`),
    currencyLabel: t('export.currency'),
    currency: bundle.project.currency,
    ownershipLabel: t('export.ownership'),
    ownership: t('export.monthCount', { count: bundle.project.ownershipMonths }),
    totalLabel: t('result.totalCost'),
    total: money(result.totalCostMinor),
    monthlyLabel: t('result.monthlyCost'),
    monthly: money(result.monthlyCostMinor),
    usageLabel: t('result.usageCost'),
    usage: result.costPerUsageMinor
      ? `${money(result.costPerUsageMinor)} / ${bundle.project.usageUnit}`
      : t('result.notAvailable'),
    breakdownTitle: t('result.breakdown'),
    breakdown: result.breakdown.map((item) => ({
      label: t(`result.breakdownLabels.${item.key}`),
      value: money(item.valueMinor),
      percent: `${formatNumber(item.percent, locale)}%`,
    })),
    assumptionsTitle: t('result.assumptionsTitle'),
    assumptions: [
      {
        label: t('wizard.fields.monthlyUsage', { unit: bundle.project.usageUnit }),
        value: formatNumber(bundle.project.usagePerMonth ?? 0, locale),
      },
      {
        label: t('result.completeness'),
        value: `${formatNumber(result.completenessScore, locale)}%`,
      },
    ],
    financingTitle: t('export.financingTitle'),
    financing: result.financingSummary
      ? [
          {
            label: t('export.financedPrincipal'),
            value: money(result.financingSummary.principalMinor),
          },
          {
            label: t('export.interestCost'),
            value: money(result.financingSummary.interestCostMinor),
          },
          { label: t('export.loanFees'), value: money(result.financingSummary.loanFeesMinor) },
        ]
      : undefined,
    scenariosTitle: t('scenarios.summaryTitle'),
    scenarios: [
      { label: t('scenarios.low'), value: money(analysis.low.totalCostMinor) },
      { label: t('scenarios.base'), value: money(analysis.base.totalCostMinor) },
      { label: t('scenarios.high'), value: money(analysis.high.totalCostMinor) },
      { label: t('scenarios.rangeLabel'), value: money(analysis.spreadMinor) },
    ],
    legalTitle: t('export.legalTitle'),
    legalDisclaimer: t('export.legalDisclaimer'),
    appVersionLabel: t('export.appVersion'),
    appVersion: Constants.expoConfig?.version ?? '1.0.0',
    engineVersionLabel: t('export.engineVersion'),
    engineVersion: result.calculationEngineVersion,
  });
  const cardModel = (): ResultCardViewModel => ({
    brand: 'Hidden Cost',
    projectTitle: bundle.project.title,
    totalLabel: t('result.totalCost'),
    total: money(result.totalCostMinor),
    monthlyLabel: t('result.monthlyCost'),
    monthly: money(result.monthlyCostMinor),
    usageLabel: t('result.usageCost'),
    usage: result.costPerUsageMinor ? money(result.costPerUsageMinor) : t('result.notAvailable'),
    completenessLabel: t('result.completeness'),
    completeness: `${formatNumber(result.completenessScore, locale)}%`,
    disclaimer: t('export.cardDisclaimer'),
  });
  const run = async (kind: 'pdf' | 'card') => {
    setBusy(kind);
    setError(false);
    setOutcome(null);
    try {
      const nextOutcome = await documentExporter.exportHtml(
        kind === 'pdf' ? 'project_pdf' : 'result_card',
        kind === 'pdf' ? buildProjectReportHtml(projectModel()) : buildResultCardHtml(cardModel()),
        kind === 'pdf' ? t('export.projectReportTitle') : t('export.resultCardTitle'),
      );
      setOutcome(nextOutcome);
    } catch {
      setError(true);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      <AppText variant="subtitle">{t('export.title')}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <Button
          label={t('export.pdfAction')}
          loading={busy === 'pdf'}
          onPress={() => void run('pdf')}
          variant="secondary"
        />
        <Button
          label={t('export.cardAction')}
          loading={busy === 'card'}
          onPress={() => void run('card')}
          variant="secondary"
        />
      </View>
      {outcome ? (
        <AppText accessibilityLiveRegion="polite" tone="success">
          {outcome.mode === 'shared' ? t('export.shared') : t('export.fallbackPrinted')}
        </AppText>
      ) : null}
      {error ? (
        <AppText accessibilityLiveRegion="assertive" tone="danger">
          {t('export.failed')}
        </AppText>
      ) : null}
    </View>
  );
}
