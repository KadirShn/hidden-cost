import { Decimal } from 'decimal.js';

import { calculateCostProject } from './calculation/engine';

import type { CalculationResult } from './calculation/types';
import type { CalculationInput } from './schemas';

export type ScenarioOverrideValue = string | number | boolean;
export type ScenarioOverrideInput = {
  scenario: 'low' | 'high';
  path: string;
  value: ScenarioOverrideValue;
};

export type ScenarioImpact = ScenarioOverrideInput & {
  deltaMinor: string;
  absoluteDeltaMinor: string;
};

export type ScenarioAnalysis = {
  low: CalculationResult;
  base: CalculationResult;
  high: CalculationResult;
  minimumTotalMinor: string;
  maximumTotalMinor: string;
  spreadMinor: string;
  mostInfluential?: ScenarioImpact;
};

function overrideMap(
  records: ScenarioOverrideInput[],
  scenario: ScenarioOverrideInput['scenario'],
): Record<string, ScenarioOverrideValue> {
  return Object.fromEntries(
    records
      .filter((record) => record.scenario === scenario)
      .map(({ path, value }) => [path, value]),
  );
}

export function analyzeScenarios(
  input: Omit<CalculationInput, 'scenario'>,
  overrides: ScenarioOverrideInput[],
): ScenarioAnalysis {
  const base = calculateCostProject(input);
  const lowOverrides = overrideMap(overrides, 'low');
  const highOverrides = overrideMap(overrides, 'high');
  const low = calculateCostProject({
    ...input,
    scenario: { kind: 'low', overrides: lowOverrides },
  });
  const high = calculateCostProject({
    ...input,
    scenario: { kind: 'high', overrides: highOverrides },
  });
  const totals = [low.totalCostMinor, base.totalCostMinor, high.totalCostMinor].map(
    (value) => new Decimal(value),
  );
  const minimum = Decimal.min(...totals);
  const maximum = Decimal.max(...totals);
  const impacts = overrides.map((override): ScenarioImpact => {
    const result = calculateCostProject({
      ...input,
      scenario: { kind: override.scenario, overrides: { [override.path]: override.value } },
    });
    const delta = new Decimal(result.totalCostMinor).minus(base.totalCostMinor);
    return {
      ...override,
      deltaMinor: delta.toFixed(0),
      absoluteDeltaMinor: delta.abs().toFixed(0),
    };
  });
  const mostInfluential = impacts.sort((left, right) =>
    new Decimal(right.absoluteDeltaMinor).comparedTo(left.absoluteDeltaMinor),
  )[0];

  return {
    low,
    base,
    high,
    minimumTotalMinor: minimum.toFixed(0),
    maximumTotalMinor: maximum.toFixed(0),
    spreadMinor: maximum.minus(minimum).toFixed(0),
    mostInfluential,
  };
}
