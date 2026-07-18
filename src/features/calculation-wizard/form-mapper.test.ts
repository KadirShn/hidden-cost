import { describe, expect, it } from '@jest/globals';

import { seedTemplates } from '@/data/templates/seed-templates';
import { calculateCostProject } from '@/domain';

import { createProjectDraft, formToProjectBundle } from './form-mapper';

describe('motorcycle wizard mapping', () => {
  it('maps purchase, financing, fuel, maintenance and residual value into the domain', () => {
    const template = seedTemplates.find((item) => item.id === 'motorcycle')!;
    const project = createProjectDraft(template, 'Test motorcycle', '2026-01-01T00:00:00.000Z');
    const bundle = formToProjectBundle(
      {
        title: 'Test motorcycle',
        ownershipMonths: '36',
        monthlyUsage: '1.000',
        purchasePrice: '300.000,00',
        financingEnabled: true,
        financedAmount: '200.000,00',
        annualInterestRate: '0',
        termMonths: '24',
        loanFees: '1.000,00',
        maintenanceAnnual: '12.000,00',
        fuelConsumption: '4',
        fuelUnitPrice: '50,00',
        residualValue: '180.000,00',
        sellingCosts: '2.000,00',
        notes: '',
      },
      { project, costItems: [], scenarioOverrides: [] },
      'tr',
      { maintenance: 'Bakım', fuel: 'Yakıt' },
      '2026-01-01T00:00:00.000Z',
    );
    const result = calculateCostProject({ project: bundle.project, costItems: bundle.costItems });

    expect(bundle.project.purchasePriceMinor).toBe('30000000');
    expect(bundle.project.financing?.downPaymentMinor).toBe('10000000');
    expect(bundle.costItems.find((item) => item.key === 'fuel')?.unitPriceMinor).toBe('5000');
    expect(result.financingSummary?.interestCostMinor).toBe('0');
    expect(result.totalCostMinor).toBe('23100000');
  });
});
