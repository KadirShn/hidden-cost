import { describe, expect, it } from '@jest/globals';

import { projectFixture, costItemFixture } from '@/domain/calculation/__fixtures__/builders';

import { formToScenarioOverrides, scenarioToForm } from './scenario-form';

describe('scenario form mapping', () => {
  it('round-trips Turkish money inputs as sparse override records', () => {
    const project = projectFixture({
      usagePerMonth: 1000,
      residualValue: { mode: 'fixed', fixedAmountMinor: '10000000', sellingCostsMinor: '0' },
    });
    const bundle = {
      project,
      costItems: [
        costItemFixture({
          id: 'maintenance',
          key: 'maintenance',
          type: 'recurring',
          frequency: 'annual',
          amountMinor: '1200000',
        }),
        costItemFixture({
          id: 'fuel',
          key: 'fuel',
          type: 'usage',
          amountMinor: undefined,
          consumptionPer100Units: 4,
          unitPriceMinor: '5000',
        }),
      ],
      scenarioOverrides: [],
    };
    const records = formToScenarioOverrides(
      bundle,
      {
        monthlyUsage: '1.200',
        maintenanceAmount: '15.000,00',
        fuelUnitPrice: '55,00',
        residualValue: '90.000,00',
        interestRate: '0',
      },
      'high',
      'tr',
      '2026-01-01T00:00:00.000Z',
    );

    expect(records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'project.usagePerMonth', value: 1200 }),
        expect.objectContaining({ path: 'costItem.maintenance.amountMinor', value: '1500000' }),
        expect.objectContaining({ path: 'costItem.fuel.unitPriceMinor', value: '5500' }),
      ]),
    );
    expect(scenarioToForm(bundle, records, 'high', 'tr').maintenanceAmount).toBe('15.000,00');
  });
});
