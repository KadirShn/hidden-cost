import { CalculationInputSchema } from '../schemas';

import type { CalculationInput, CostItem } from '../schemas';

type Primitive = string | number | boolean;

export class ScenarioOverrideError extends Error {
  constructor(path: string) {
    super(`Unsupported scenario override: ${path}`);
    this.name = 'ScenarioOverrideError';
  }
}

const projectFields = new Set(['purchasePriceMinor', 'ownershipMonths', 'usagePerMonth']);
const financingFields = new Set([
  'downPaymentMinor',
  'financedAmountMinor',
  'annualInterestRate',
  'termMonths',
  'loanFeesMinor',
]);
const residualFields = new Set(['fixedAmountMinor', 'retainedValuePercent', 'sellingCostsMinor']);
const costItemFields = new Set([
  'amountMinor',
  'costPerUnitMinor',
  'consumptionPer100Units',
  'unitPriceMinor',
  'startsAtMonth',
  'endsAtMonth',
  'isEnabled',
]);

function setCostItemField(item: CostItem, field: string, value: Primitive): CostItem {
  if (!costItemFields.has(field)) throw new ScenarioOverrideError(`costItem.${item.id}.${field}`);
  return { ...item, [field]: value } as CostItem;
}

export function applyScenario(input: CalculationInput): CalculationInput {
  const scenario = input.scenario ?? { kind: 'base' as const };
  const scenarioOverrides =
    scenario.kind === 'low'
      ? input.project.assumptions.lowOverrides
      : scenario.kind === 'high'
        ? input.project.assumptions.highOverrides
        : {};
  const overrides = {
    ...input.project.assumptions.base,
    ...scenarioOverrides,
    ...scenario.overrides,
  };

  let project = { ...input.project };
  let costItems = input.costItems.map((item) => ({ ...item }));

  for (const [path, value] of Object.entries(overrides)) {
    const segments = path.split('.');
    if (segments[0] === 'project' && segments.length === 2 && projectFields.has(segments[1])) {
      project = { ...project, [segments[1]]: value };
      continue;
    }
    if (
      segments[0] === 'financing' &&
      segments.length === 2 &&
      financingFields.has(segments[1]) &&
      project.financing
    ) {
      project = { ...project, financing: { ...project.financing, [segments[1]]: value } };
      continue;
    }
    if (
      segments[0] === 'residualValue' &&
      segments.length === 2 &&
      residualFields.has(segments[1]) &&
      project.residualValue
    ) {
      project = {
        ...project,
        residualValue: { ...project.residualValue, [segments[1]]: value },
      };
      continue;
    }
    if (segments[0] === 'costItem' && segments.length === 3) {
      const itemIndex = costItems.findIndex((item) => item.id === segments[1]);
      if (itemIndex >= 0) {
        costItems[itemIndex] = setCostItemField(costItems[itemIndex], segments[2], value);
        continue;
      }
    }
    throw new ScenarioOverrideError(path);
  }

  return CalculationInputSchema.parse({ ...input, project, costItems, scenario });
}
