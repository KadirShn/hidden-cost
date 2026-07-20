import { Decimal } from 'decimal.js';

import type { BreakdownItem, CalculationResult } from './calculation/types';

export type ResultInsight =
  | Readonly<{ key: 'improve_completeness'; score: number }>
  | Readonly<{ key: 'hidden_costs_significant'; ratioPercent: number }>
  | Readonly<{ key: 'purchase_dominates'; sharePercent: number }>
  | Readonly<{
      key: 'operating_driver';
      driver: Exclude<BreakdownItem['key'], 'purchase' | 'residual'>;
      sharePercent: number;
    }>
  | Readonly<{ key: 'resale_offsets'; valueMinor: string }>;

export function deriveResultInsights(result: CalculationResult): ResultInsight[] {
  const insights: ResultInsight[] = [];
  if (result.completenessScore < 80) {
    insights.push({ key: 'improve_completeness', score: result.completenessScore });
  }

  if (result.hiddenCostRatio !== null && result.hiddenCostRatio >= 0.5) {
    insights.push({
      key: 'hidden_costs_significant',
      ratioPercent: Math.round(result.hiddenCostRatio * 100),
    });
  } else if (result.purchaseSharePercent >= 65) {
    insights.push({
      key: 'purchase_dominates',
      sharePercent: Math.round(result.purchaseSharePercent),
    });
  }

  const operatingDriver = result.topDrivers.find(
    (
      item,
    ): item is BreakdownItem & {
      key: Exclude<BreakdownItem['key'], 'purchase' | 'residual'>;
    } => item.key !== 'purchase' && item.key !== 'residual',
  );
  if (operatingDriver && operatingDriver.percent >= 10) {
    insights.push({
      key: 'operating_driver',
      driver: operatingDriver.key,
      sharePercent: Math.round(operatingDriver.percent),
    });
  }

  const residual = result.breakdown.find(({ key }) => key === 'residual');
  if (residual && new Decimal(residual.valueMinor).isNegative()) {
    insights.push({ key: 'resale_offsets', valueMinor: residual.valueMinor.replace('-', '') });
  }
  return insights.slice(0, 3);
}
