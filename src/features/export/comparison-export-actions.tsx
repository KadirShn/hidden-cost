import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { compareProjects, type ComparisonEntry } from '@/domain';
import { useAds } from '@/features/ads/use-ads';
import { useSettings } from '@/features/settings/use-settings';
import type { ExportOutcome } from '@/services/export/document-exporter';
import { documentExporter } from '@/services/export/expo-document-exporter';
import {
  buildComparisonReportHtml,
  type ComparisonReportViewModel,
} from '@/services/export/report-html';
import { formatMinorCurrency, getLocaleTag } from '@/utils/format';

export function ComparisonExportActions({ entries }: { entries: ComparisonEntry[] }) {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const ads = useAds();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [outcome, setOutcome] = useState<ExportOutcome | null>(null);
  const [rewardPromptVisible, setRewardPromptVisible] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const comparison = compareProjects(entries);
  const generatedAt = new Intl.DateTimeFormat(getLocaleTag(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
  const model: ComparisonReportViewModel = {
    documentTitle: t('export.comparisonReportTitle'),
    generatedAtLabel: t('export.generatedAt', { date: generatedAt }),
    projects: entries.map(({ project, result }) => ({
      title: project.title,
      currency: project.currency,
      ownership: t('export.monthCount', { count: project.ownershipMonths }),
      total: formatMinorCurrency(result.totalCostMinor, project.currency, locale),
      monthly: formatMinorCurrency(result.monthlyCostMinor, project.currency, locale),
      usage: result.costPerUsageMinor
        ? `${formatMinorCurrency(result.costPerUsageMinor, project.currency, locale)} / ${project.usageUnit}`
        : t('result.notAvailable'),
    })),
    headers: {
      project: t('export.project'),
      currency: t('export.currency'),
      ownership: t('export.ownership'),
      total: t('result.totalCost'),
      monthly: t('result.monthlyCost'),
      usage: t('result.usageCost'),
    },
    warningsTitle: t('export.warningsTitle'),
    warnings: comparison.warnings.map((warning) => t(`comparison.warnings.${warning}`)),
    legalTitle: t('export.legalTitle'),
    legalDisclaimer: t('export.legalDisclaimer'),
    engineVersionLabel: t('export.engineVersion'),
    engineVersion: entries[0].result.calculationEngineVersion,
  };
  const run = async () => {
    setLoading(true);
    setError(false);
    setOutcome(null);
    setCancelled(false);
    try {
      if (ads.rewardedExportEnabled) {
        const reward = await ads.requestRewardedExport(true);
        if (reward === 'dismissed') {
          setCancelled(true);
          return;
        }
      }
      setOutcome(
        await documentExporter.exportHtml(
          'comparison_pdf',
          buildComparisonReportHtml(model),
          t('export.comparisonReportTitle'),
        ),
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        fullWidth
        label={t('export.comparisonAction')}
        loading={loading}
        onPress={() => (ads.rewardedExportEnabled ? setRewardPromptVisible(true) : void run())}
      />
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
      {cancelled ? (
        <AppText accessibilityLiveRegion="polite" tone="secondary">
          {t('ads.rewardCancelled')}
        </AppText>
      ) : null}
      <ConfirmDialog
        cancelLabel={t('common.cancel')}
        confirmLabel={t('ads.watchRewarded')}
        message={t('ads.rewardedBody')}
        onCancel={() => {
          setRewardPromptVisible(false);
          setCancelled(true);
          void ads.requestRewardedExport(false);
        }}
        onConfirm={() => {
          setRewardPromptVisible(false);
          void run();
        }}
        title={t('ads.rewardedTitle')}
        visible={rewardPromptVisible}
      />
    </>
  );
}
