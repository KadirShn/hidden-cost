import { describe, expect, it } from '@jest/globals';

import { costItemFixture, projectFixture } from './__fixtures__/builders';
import { goldenFixtures } from './__fixtures__/golden';
import { calculateCostProject } from './engine';
import { CalculationResultSchema } from './types';

describe('calculation engine golden fixtures', () => {
  it.each(goldenFixtures)('$name', ({ input, expected }) => {
    const result = calculateCostProject(input);
    expect(CalculationResultSchema.parse(result)).toEqual(result);
    expect(result).toMatchObject(expected);
  });
});

describe('calculation engine', () => {
  it('calculates zero-interest financing without adding principal twice', () => {
    const result = calculateCostProject({
      project: projectFixture({
        purchasePriceMinor: '10000000',
        financing: {
          enabled: true,
          downPaymentMinor: '2000000',
          financedAmountMinor: '8000000',
          annualInterestRate: 0,
          termMonths: 12,
          loanFeesMinor: '0',
        },
      }),
      costItems: [],
    });

    expect(result.totalCostMinor).toBe('10000000');
    expect(result.financingSummary).toEqual({
      principalMinor: '8000000',
      monthlyPaymentMinor: '666667',
      totalLoanPaymentsMinor: '8000000',
      interestCostMinor: '0',
      loanFeesMinor: '0',
      financingCostMinor: '0',
    });
  });

  it('calculates an amortized loan and adds only interest and fees to TCO', () => {
    const result = calculateCostProject({
      project: projectFixture({
        purchasePriceMinor: '15000000',
        financing: {
          enabled: true,
          downPaymentMinor: '3000000',
          financedAmountMinor: '12000000',
          annualInterestRate: 12,
          termMonths: 12,
          loanFeesMinor: '100000',
        },
      }),
      costItems: [],
    });

    expect(result.financingSummary).toMatchObject({
      principalMinor: '12000000',
      monthlyPaymentMinor: '1066185',
      interestCostMinor: '794226',
      financingCostMinor: '894226',
    });
    expect(result.totalCostMinor).toBe('15894226');
    expect(result.totalCostMinor).not.toBe('27894226');
  });

  it('converts monthly, quarterly, semiannual, and annual costs', () => {
    const items = [
      ['monthly', 'monthly'],
      ['quarterly', 'quarterly'],
      ['semiannual', 'semiannual'],
      ['annual', 'annual'],
    ] as const;
    const result = calculateCostProject({
      project: projectFixture({ purchasePriceMinor: '0' }),
      costItems: items.map(([id, frequency], index) =>
        costItemFixture({
          id,
          type: 'recurring',
          amountMinor: '1200',
          frequency,
          sortOrder: index,
        }),
      ),
    });

    expect(result.totalCostMinor).toBe('22800');
  });

  it('uses an inclusive, ownership-clamped active month range', () => {
    const result = calculateCostProject({
      project: projectFixture({ purchasePriceMinor: '0', ownershipMonths: 12 }),
      costItems: [
        costItemFixture({
          type: 'recurring',
          amountMinor: '1000',
          frequency: 'monthly',
          startsAtMonth: 3,
          endsAtMonth: 5,
        }),
      ],
    });
    expect(result.totalCostMinor).toBe('3000');
  });

  it('calculates fuel consumption from distance, consumption, and unit price', () => {
    const result = calculateCostProject({
      project: projectFixture({
        purchasePriceMinor: '0',
        usagePerMonth: 1000,
        usageUnit: 'km',
      }),
      costItems: [
        costItemFixture({
          type: 'usage',
          amountMinor: undefined,
          consumptionPer100Units: 5,
          unitPriceMinor: '200',
          unit: 'liter',
        }),
      ],
    });

    expect(result.totalUsage).toBe(12000);
    expect(result.totalCostMinor).toBe('120000');
    expect(result.costPerUsageMinor).toBe('10');
  });

  it('returns no per-usage metric and a warning for zero usage', () => {
    const result = calculateCostProject({
      project: projectFixture({ usagePerMonth: 0, usageUnit: 'km' }),
      costItems: [
        costItemFixture({ type: 'usage', amountMinor: undefined, costPerUnitMinor: '100' }),
      ],
    });

    expect(result.costPerUsageMinor).toBeUndefined();
    expect(result.warnings).toContain('zero_total_usage');
    expect(result.warnings).toContain('missing_usage_estimate');
  });

  it('subtracts net residual value after selling costs', () => {
    const result = calculateCostProject({
      project: projectFixture({
        purchasePriceMinor: '10000',
        residualValue: {
          mode: 'fixed',
          fixedAmountMinor: '6000',
          sellingCostsMinor: '1000',
        },
      }),
      costItems: [],
    });
    expect(result.grossCostMinor).toBe('10000');
    expect(result.totalCostMinor).toBe('5000');
    expect(result.hiddenCostMinor).toBe('-5000');
  });

  it('preserves large amounts through the complete engine', () => {
    const result = calculateCostProject({
      project: projectFixture({ purchasePriceMinor: '900719925474099300' }),
      costItems: [costItemFixture({ amountMinor: '700' })],
    });
    expect(result.totalCostMinor).toBe('900719925474100000');
  });

  it('applies base, low, and high scenario overrides without mutating input', () => {
    const project = projectFixture({
      purchasePriceMinor: '10000',
      assumptions: {
        base: { 'costItem.item-1.amountMinor': '1000' },
        lowOverrides: { 'costItem.item-1.amountMinor': '500' },
        highOverrides: { 'costItem.item-1.amountMinor': '2000' },
      },
    });
    const input = { project, costItems: [costItemFixture({ amountMinor: '9999' })] };

    expect(calculateCostProject(input).totalCostMinor).toBe('11000');
    expect(calculateCostProject({ ...input, scenario: { kind: 'low' } }).totalCostMinor).toBe(
      '10500',
    );
    expect(calculateCostProject({ ...input, scenario: { kind: 'high' } }).totalCostMinor).toBe(
      '12000',
    );
    expect(input.costItems[0].amountMinor).toBe('9999');
  });

  it('scores completeness and emits stable missing-data warnings', () => {
    const result = calculateCostProject({ project: projectFixture(), costItems: [] });
    expect(result.completenessScore).toBe(45);
    expect(result.completenessLevel).toBe('low');
    expect(result.warnings).toEqual([
      'missing_residual_value',
      'missing_recurring_costs',
      'missing_usage_estimate',
      'zero_total_usage',
    ]);
  });

  it('rounds only after summing fractional monthly equivalents', () => {
    const result = calculateCostProject({
      project: projectFixture({ purchasePriceMinor: '0', ownershipMonths: 1 }),
      costItems: [
        costItemFixture({
          id: 'annual-1',
          type: 'recurring',
          amountMinor: '100',
          frequency: 'annual',
        }),
        costItemFixture({
          id: 'annual-2',
          type: 'recurring',
          amountMinor: '100',
          frequency: 'annual',
        }),
      ],
    });
    expect(result.totalCostMinor).toBe('17');
  });
});
