import { costItemFixture, projectFixture } from './builders';

import type { CalculationInput } from '../../schemas';
import type { CalculationResult } from '../types';

export type GoldenFixture = {
  name: string;
  input: CalculationInput;
  expected: Partial<CalculationResult> & {
    totalCostMinor: string;
    grossCostMinor: string;
    hiddenCostMinor: string;
    monthlyCostMinor: string;
  };
};

export const purchaseOnlyGolden: GoldenFixture = {
  name: 'purchase only',
  input: {
    project: projectFixture({ purchasePriceMinor: '30000000', ownershipMonths: 36 }),
    costItems: [],
  },
  expected: {
    totalCostMinor: '30000000',
    grossCostMinor: '30000000',
    hiddenCostMinor: '0',
    monthlyCostMinor: '833333',
    completenessScore: 45,
    warnings: [
      'missing_residual_value',
      'missing_recurring_costs',
      'missing_usage_estimate',
      'zero_total_usage',
    ],
  },
};

export const motorcycleGolden: GoldenFixture = {
  name: '36 month financed motorcycle',
  input: {
    project: projectFixture({
      category: 'motorcycle',
      templateId: 'motorcycle-v1',
      purchasePriceMinor: '30000000',
      ownershipMonths: 36,
      usagePerMonth: 1000,
      usageUnit: 'km',
      financing: {
        enabled: true,
        downPaymentMinor: '15000000',
        financedAmountMinor: '15000000',
        annualInterestRate: 24,
        termMonths: 24,
        loanFeesMinor: '300000',
      },
      residualValue: {
        mode: 'fixed',
        fixedAmountMinor: '21000000',
        sellingCostsMinor: '500000',
      },
    }),
    costItems: [
      costItemFixture({ id: 'registration', label: 'Registration', amountMinor: '1200000' }),
      costItemFixture({ id: 'gear', label: 'Protective gear', amountMinor: '1800000' }),
      costItemFixture({
        id: 'insurance',
        type: 'recurring',
        label: 'Insurance',
        amountMinor: '1200000',
        frequency: 'annual',
      }),
      costItemFixture({
        id: 'tax',
        type: 'recurring',
        label: 'Tax',
        amountMinor: '180000',
        frequency: 'semiannual',
      }),
      costItemFixture({
        id: 'maintenance',
        type: 'recurring',
        label: 'Maintenance',
        amountMinor: '600000',
        frequency: 'annual',
      }),
      costItemFixture({
        id: 'tires',
        type: 'recurring',
        label: 'Tires',
        amountMinor: '900000',
        frequency: 'annual',
      }),
      costItemFixture({
        id: 'garage',
        type: 'recurring',
        label: 'Garage',
        amountMinor: '100000',
        frequency: 'monthly',
        startsAtMonth: 4,
        endsAtMonth: 36,
      }),
      costItemFixture({
        id: 'fuel',
        type: 'usage',
        label: 'Fuel',
        amountMinor: undefined,
        unit: 'liter',
        consumptionPer100Units: 3.5,
        unitPriceMinor: '4600',
      }),
    ],
  },
  expected: {
    totalCostMinor: '35109595',
    grossCostMinor: '55609595',
    hiddenCostMinor: '5109595',
    monthlyCostMinor: '975267',
    costPerUsageMinor: '975',
    completenessScore: 100,
    warnings: [],
    financingSummary: {
      principalMinor: '15000000',
      monthlyPaymentMinor: '793066',
      totalLoanPaymentsMinor: '19033595',
      interestCostMinor: '4033595',
      loanFeesMinor: '300000',
      financingCostMinor: '4333595',
    },
  },
};

export const goldenFixtures = [purchaseOnlyGolden, motorcycleGolden];
