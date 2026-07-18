import { Decimal } from 'decimal.js';

import { Money } from '../money';
import { CalculationInputSchema, type CalculationInput, type CostItem } from '../schemas';

import { CALCULATION_ENGINE_VERSION } from './constants';
import { applyScenario } from './scenario';

import type {
  BreakdownItem,
  CalculationResult,
  CalculationWarning,
  CompletenessLevel,
  FinancingSummary,
} from './types';

const frequencyDivisors = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  annual: 12,
} as const;

function sum(values: Money[], currency: string): Money {
  return values.reduce((total, value) => total.add(value), Money.zero(currency));
}

function activeMonthCount(item: CostItem, ownershipMonths: number): number {
  const start = Math.max(item.startsAtMonth ?? 1, 1);
  const end = Math.min(item.endsAtMonth ?? ownershipMonths, ownershipMonths);
  return Math.max(end - start + 1, 0);
}

function percent(value: Money, total: Money): number {
  if (total.isZero()) return 0;
  return value
    .toDecimalMinor()
    .dividedBy(total.toDecimalMinor())
    .times(100)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber();
}

function calculateFinancing(input: CalculationInput): { cost: Money; summary?: FinancingSummary } {
  const { financing, currency } = input.project;
  if (!financing?.enabled) return { cost: Money.zero(currency) };

  const principal = Money.fromMinor(financing.financedAmountMinor, currency);
  const fees = Money.fromMinor(financing.loanFeesMinor, currency);
  const monthlyRate = new Decimal(financing.annualInterestRate).dividedBy(12).dividedBy(100);
  const months = financing.termMonths;
  const monthlyPayment = monthlyRate.isZero()
    ? principal.divide(months)
    : Money.fromDecimalMinor(
        principal
          .toDecimalMinor()
          .times(monthlyRate)
          .times(monthlyRate.plus(1).pow(months))
          .dividedBy(monthlyRate.plus(1).pow(months).minus(1)),
        currency,
      );
  const totalPayments = monthlyPayment.multiply(months);
  const interest = totalPayments.subtract(principal);
  const cost = interest.add(fees);

  return {
    cost,
    summary: {
      principalMinor: principal.toMinorString(),
      monthlyPaymentMinor: monthlyPayment.toMinorString(),
      totalLoanPaymentsMinor: totalPayments.toMinorString(),
      interestCostMinor: interest.toMinorString(),
      loanFeesMinor: fees.toMinorString(),
      financingCostMinor: cost.toMinorString(),
    },
  };
}

function calculateCompleteness(input: CalculationInput): {
  score: number;
  level: CompletenessLevel;
  warnings: CalculationWarning[];
} {
  const enabledItems = input.costItems.filter((item) => item.isEnabled && !item.deletedAt);
  const warnings: CalculationWarning[] = [];
  let score = 40;

  if (input.project.purchasePriceMinor === '0') warnings.push('zero_purchase_price');

  if (input.project.residualValue) score += 20;
  else warnings.push('missing_residual_value');

  if (enabledItems.some((item) => item.type === 'recurring')) score += 15;
  else warnings.push('missing_recurring_costs');

  if (input.project.usagePerMonth !== undefined && input.project.usagePerMonth > 0) score += 20;
  else warnings.push('missing_usage_estimate');

  if (!input.project.financing?.enabled || input.project.financing.termMonths > 0) score += 5;

  const defaultCount = enabledItems.filter((item) => item.isTemplateDefault).length;
  if (defaultCount > 0) {
    score -= Math.min(defaultCount * 2, 10);
    warnings.push('template_defaults_used');
  }

  score = Math.max(0, Math.min(score, 100));
  const level: CompletenessLevel = score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low';
  return { score, level, warnings };
}

export function calculateCostProject(rawInput: CalculationInput): CalculationResult {
  const parsedInput = CalculationInputSchema.parse(rawInput);
  const input = applyScenario(parsedInput);
  const { project } = input;
  const enabledItems = input.costItems.filter((item) => item.isEnabled && !item.deletedAt);
  const purchase = Money.fromMinor(project.purchasePriceMinor, project.currency);
  const initial = sum(
    enabledItems
      .filter((item) => item.type === 'initial')
      .map((item) => Money.fromMinor(item.amountMinor!, project.currency)),
    project.currency,
  );
  const recurring = sum(
    enabledItems
      .filter((item) => item.type === 'recurring')
      .map((item) =>
        Money.fromMinor(item.amountMinor!, project.currency)
          .divide(frequencyDivisors[item.frequency!])
          .multiply(activeMonthCount(item, project.ownershipMonths)),
      ),
    project.currency,
  );

  const totalUsageDecimal = new Decimal(project.usagePerMonth ?? 0).times(project.ownershipMonths);
  const usage = sum(
    enabledItems
      .filter((item) => item.type === 'usage')
      .map((item) => {
        if (item.consumptionPer100Units !== undefined && item.unitPriceMinor !== undefined) {
          return Money.fromMinor(item.unitPriceMinor, project.currency)
            .multiply(totalUsageDecimal)
            .multiply(item.consumptionPer100Units)
            .divide(100);
        }
        return Money.fromMinor(item.costPerUnitMinor!, project.currency).multiply(
          totalUsageDecimal,
        );
      }),
    project.currency,
  );

  const financing = calculateFinancing(input);
  const gross = purchase.add(initial).add(recurring).add(usage).add(financing.cost);
  const residualGross = project.residualValue
    ? project.residualValue.mode === 'fixed'
      ? Money.fromMinor(project.residualValue.fixedAmountMinor!, project.currency)
      : purchase.multiply(new Decimal(project.residualValue.retainedValuePercent!).dividedBy(100))
    : Money.zero(project.currency);
  const sellingCosts = project.residualValue
    ? Money.fromMinor(project.residualValue.sellingCostsMinor, project.currency)
    : Money.zero(project.currency);
  const netResidual = residualGross.subtract(sellingCosts).max(Money.zero(project.currency));
  const total = gross.subtract(netResidual);
  const hidden = total.subtract(purchase);
  const monthly = total.divide(project.ownershipMonths);
  const costPerUsage = totalUsageDecimal.isZero()
    ? undefined
    : Money.fromDecimalMinor(total.toDecimalMinor().dividedBy(totalUsageDecimal), project.currency);

  const breakdown: BreakdownItem[] = [
    {
      key: 'purchase',
      label: 'purchase',
      valueMinor: purchase.toMinorString(),
      percent: percent(purchase, gross),
    },
    {
      key: 'initial',
      label: 'initial',
      valueMinor: initial.toMinorString(),
      percent: percent(initial, gross),
    },
    {
      key: 'recurring',
      label: 'recurring',
      valueMinor: recurring.toMinorString(),
      percent: percent(recurring, gross),
    },
    {
      key: 'usage',
      label: 'usage',
      valueMinor: usage.toMinorString(),
      percent: percent(usage, gross),
    },
    {
      key: 'financing',
      label: 'financing',
      valueMinor: financing.cost.toMinorString(),
      percent: percent(financing.cost, gross),
    },
    {
      key: 'residual',
      label: 'residual',
      valueMinor: netResidual.multiply(-1).toMinorString(),
      percent: -percent(netResidual, gross),
    },
  ];
  const completeness = calculateCompleteness(input);
  if (totalUsageDecimal.isZero()) completeness.warnings.push('zero_total_usage');

  return {
    calculationEngineVersion: CALCULATION_ENGINE_VERSION,
    currency: project.currency,
    totalCostMinor: total.toMinorString(),
    grossCostMinor: gross.toMinorString(),
    hiddenCostMinor: hidden.toMinorString(),
    monthlyCostMinor: monthly.toMinorString(),
    costPerUsageMinor: costPerUsage?.toMinorString(),
    totalUsage: totalUsageDecimal.toNumber(),
    purchaseSharePercent: percent(purchase, gross),
    hiddenCostRatio: purchase.isZero()
      ? null
      : hidden
          .toDecimalMinor()
          .dividedBy(purchase.toDecimalMinor())
          .toDecimalPlaces(6, Decimal.ROUND_HALF_UP)
          .toNumber(),
    completenessScore: completeness.score,
    completenessLevel: completeness.level,
    breakdown,
    topDrivers: breakdown
      .filter((item) => item.key !== 'residual' && item.valueMinor !== '0')
      .sort((left, right) => new Decimal(right.valueMinor).comparedTo(left.valueMinor))
      .slice(0, 3),
    financingSummary: financing.summary,
    warnings: completeness.warnings,
  };
}
