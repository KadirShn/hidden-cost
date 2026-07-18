import { describe, expect, it } from '@jest/globals';

import { costItemFixture, projectFixture } from './calculation/__fixtures__/builders';
import { analyzeScenarios } from './scenario-analysis';

describe('scenario analysis', () => {
  it('calculates range and identifies the strongest individual override', () => {
    const project = projectFixture({
      purchasePriceMinor: '1000000',
      ownershipMonths: 12,
      usagePerMonth: 100,
      usageUnit: 'km',
      residualValue: { mode: 'fixed', fixedAmountMinor: '200000', sellingCostsMinor: '0' },
    });
    const fuel = costItemFixture({
      id: 'fuel',
      key: 'fuel',
      type: 'usage',
      amountMinor: undefined,
      unit: 'liter',
      consumptionPer100Units: 5,
      unitPriceMinor: '5000',
    });

    const analysis = analyzeScenarios({ project, costItems: [fuel] }, [
      { scenario: 'low', path: 'costItem.fuel.unitPriceMinor', value: '4000' },
      { scenario: 'high', path: 'costItem.fuel.unitPriceMinor', value: '7000' },
      { scenario: 'high', path: 'project.usagePerMonth', value: 200 },
    ]);

    expect(analysis.low.totalCostMinor).toBe('1040000');
    expect(analysis.base.totalCostMinor).toBe('1100000');
    expect(analysis.high.totalCostMinor).toBe('1640000');
    expect(analysis.spreadMinor).toBe('600000');
    expect(analysis.mostInfluential).toMatchObject({
      path: 'project.usagePerMonth',
      scenario: 'high',
      absoluteDeltaMinor: '300000',
    });
  });
});
