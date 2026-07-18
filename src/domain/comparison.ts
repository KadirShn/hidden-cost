import { Decimal } from 'decimal.js';

import type { CalculationResult } from './calculation/types';
import type { CostProject } from './schemas';

export type ComparisonWarning =
  'different_currencies' | 'different_ownership_periods' | 'incompatible_usage_units';

export type ComparisonEntry = {
  project: CostProject;
  result: CalculationResult;
};

export type ComparisonResult = {
  warnings: ComparisonWarning[];
  normalizedTotals?: { projectId: string; months: number; valueMinor: string }[];
  lowestTotalProjectIds: string[];
  lowestMonthlyProjectIds: string[];
  lowestUsageCostProjectIds: string[];
};

function lowestIds(
  entries: ComparisonEntry[],
  select: (entry: ComparisonEntry) => Decimal.Value,
): string[] {
  const lowest = Decimal.min(...entries.map((entry) => new Decimal(select(entry))));
  return entries
    .filter((entry) => new Decimal(select(entry)).equals(lowest))
    .map(({ project }) => project.id);
}

export function compareProjects(
  entries: ComparisonEntry[],
  options: { normalizeToMonths?: number } = {},
): ComparisonResult {
  if (entries.length < 2 || entries.length > 3) {
    throw new RangeError('Comparison requires two or three projects');
  }

  const warnings: ComparisonWarning[] = [];
  const sameCurrency = new Set(entries.map(({ project }) => project.currency)).size === 1;
  const sameDuration = new Set(entries.map(({ project }) => project.ownershipMonths)).size === 1;
  const usageUnits = entries.map(({ project }) => project.usageUnit);
  const compatibleUsage =
    usageUnits.every((unit) => unit !== undefined && unit === usageUnits[0]) &&
    entries.every(({ result }) => result.costPerUsageMinor !== undefined);

  if (!sameCurrency) warnings.push('different_currencies');
  if (!sameDuration) warnings.push('different_ownership_periods');
  if (!compatibleUsage) warnings.push('incompatible_usage_units');

  const comparable = sameCurrency ? entries : [];
  const normalizedMonths = options.normalizeToMonths;
  if (
    normalizedMonths !== undefined &&
    (!Number.isInteger(normalizedMonths) || normalizedMonths < 1)
  ) {
    throw new RangeError('Normalization months must be a positive integer');
  }

  return {
    warnings,
    normalizedTotals:
      sameCurrency && normalizedMonths !== undefined
        ? entries.map(({ project, result }) => ({
            projectId: project.id,
            months: normalizedMonths,
            valueMinor: new Decimal(result.totalCostMinor)
              .dividedBy(project.ownershipMonths)
              .times(normalizedMonths)
              .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
              .toFixed(0),
          }))
        : undefined,
    lowestTotalProjectIds: comparable.length
      ? lowestIds(comparable, ({ result }) => result.totalCostMinor)
      : [],
    lowestMonthlyProjectIds: comparable.length
      ? lowestIds(comparable, ({ project, result }) =>
          new Decimal(result.totalCostMinor).dividedBy(project.ownershipMonths),
        )
      : [],
    lowestUsageCostProjectIds:
      sameCurrency && compatibleUsage
        ? lowestIds(entries, ({ result }) => result.costPerUsageMinor!)
        : [],
  };
}
