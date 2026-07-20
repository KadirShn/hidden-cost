import { describe, expect, it } from '@jest/globals';

import { costItemFixture, projectFixture } from './calculation/__fixtures__/builders';
import { calculateCostProject } from './calculation/engine';
import { deriveResultInsights } from './result-insights';

describe('deriveResultInsights', () => {
  it('prioritizes completeness and significant hidden costs', () => {
    const result = calculateCostProject({
      project: projectFixture({ purchasePriceMinor: '10000', ownershipMonths: 12 }),
      costItems: [
        costItemFixture({ type: 'recurring', amountMinor: '12000', frequency: 'annual' }),
      ],
    });

    expect(deriveResultInsights(result).map(({ key }) => key)).toEqual([
      'improve_completeness',
      'hidden_costs_significant',
      'operating_driver',
    ]);
  });

  it('explains purchase dominance and the resale offset without advice claims', () => {
    const result = calculateCostProject({
      project: projectFixture({
        purchasePriceMinor: '100000',
        ownershipMonths: 12,
        residualValue: { mode: 'fixed', fixedAmountMinor: '20000', sellingCostsMinor: '0' },
      }),
      costItems: [],
    });

    expect(deriveResultInsights(result)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'purchase_dominates' }),
        { key: 'resale_offsets', valueMinor: '20000' },
      ]),
    );
  });
});
