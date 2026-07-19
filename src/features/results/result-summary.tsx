import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ExpandableSection } from '@/components/ui/expandable-section';
import { MetricCard } from '@/components/ui/metric-card';
import type { CalculationResult } from '@/domain/calculation/types';
import { useSettings } from '@/features/settings/use-settings';
import { useTheme } from '@/hooks/use-theme';
import { formatMinorCurrency, formatNumber } from '@/utils/format';

export function ResultSummary({ result }: { result: CalculationResult }) {
  const { t } = useTranslation();
  const { locale } = useSettings();
  const theme = useTheme();
  const money = (minor: string) => formatMinorCurrency(minor, result.currency, locale);
  const colors = {
    purchase: theme.colors.chartPurchase,
    initial: theme.colors.textSecondary,
    recurring: theme.colors.chartRecurring,
    usage: theme.colors.chartUsage,
    financing: theme.colors.chartFinancing,
    residual: theme.colors.chartResidual,
  };

  return (
    <>
      <MetricCard
        elevated
        label={t('result.totalCost')}
        supportingText={t('result.totalCostHelp')}
        value={money(result.totalCostMinor)}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md }}>
        <MetricCard
          label={t('result.monthlyCost')}
          style={{ flex: 1, minWidth: 220 }}
          value={money(result.monthlyCostMinor)}
        />
        <MetricCard
          label={t('result.usageCost')}
          style={{ flex: 1, minWidth: 220 }}
          value={
            result.costPerUsageMinor ? money(result.costPerUsageMinor) : t('result.notAvailable')
          }
        />
      </View>
      <Card>
        <AppText variant="subtitle">{t('result.breakdown')}</AppText>
        {result.breakdown.map((item) => (
          <View key={item.key} style={{ gap: theme.spacing.xs }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: theme.spacing.sm,
                justifyContent: 'space-between',
              }}
            >
              <AppText variant="label">{t(`result.breakdownLabels.${item.key}`)}</AppText>
              <AppText selectable variant="label">
                {money(item.valueMinor)} · {formatNumber(item.percent, locale)}%
              </AppText>
            </View>
            <View
              accessible
              accessibilityLabel={t('result.breakdownAccessible', {
                label: t(`result.breakdownLabels.${item.key}`),
                value: money(item.valueMinor),
                percent: formatNumber(item.percent, locale),
              })}
              accessibilityRole="image"
              style={{
                backgroundColor: theme.colors.surfaceMuted,
                borderRadius: theme.radius.pill,
                height: 12,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  backgroundColor: colors[item.key],
                  height: '100%',
                  width: `${Math.min(Math.abs(item.percent), 100)}%`,
                }}
              />
            </View>
          </View>
        ))}
        <AppText variant="subtitle">{t('result.topDrivers')}</AppText>
        {result.topDrivers.map((item, index) => (
          <View key={item.key} style={{ flexDirection: 'row', gap: theme.spacing.md }}>
            <AppText variant="label" tone="accent">
              {index + 1}
            </AppText>
            <AppText style={{ flex: 1 }}>{t(`result.breakdownLabels.${item.key}`)}</AppText>
            <AppText selectable variant="label">
              {money(item.valueMinor)}
            </AppText>
          </View>
        ))}
      </Card>
      <ExpandableSection
        collapseLabel={t('result.collapseAssumptions')}
        expandLabel={t('result.expandAssumptions')}
        title={t('result.assumptionsTitle')}
      >
        <AppText selectable>{t('result.formulas.tco')}</AppText>
        <AppText selectable>{t('result.formulas.recurring')}</AppText>
        <AppText selectable>{t('result.formulas.fuel')}</AppText>
        <AppText selectable>{t('result.formulas.financing')}</AppText>
        <AppText selectable variant="helper" tone="secondary">
          {t('result.engineVersion', { version: result.calculationEngineVersion })}
        </AppText>
      </ExpandableSection>
      <Card>
        <AppText variant="subtitle">{t('result.completeness')}</AppText>
        <AppText variant="metric">{formatNumber(result.completenessScore, locale)}%</AppText>
        <View
          accessible
          accessibilityLabel={t('result.completenessAccessible', {
            value: result.completenessScore,
          })}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: result.completenessScore }}
          style={{
            backgroundColor: theme.colors.surfaceMuted,
            borderRadius: theme.radius.pill,
            height: 10,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.accent,
              height: '100%',
              width: `${result.completenessScore}%`,
            }}
          />
        </View>
        <AppText tone="secondary">
          {t(`result.completenessLevels.${result.completenessLevel}`)}
        </AppText>
      </Card>
      {result.warnings.length ? (
        <Card>
          <AppText variant="subtitle">{t('result.warningsTitle')}</AppText>
          {result.warnings.map((warning) => (
            <AppText key={warning} selectable tone="warning">
              • {t(`result.warnings.${warning}`)}
            </AppText>
          ))}
        </Card>
      ) : null}
    </>
  );
}
