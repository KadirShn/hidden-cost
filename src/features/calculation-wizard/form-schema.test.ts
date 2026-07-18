import { describe, expect, it } from '@jest/globals';

import { createWizardFormSchema } from './form-schema';

const validValues = {
  title: 'Motorcycle',
  ownershipMonths: '36',
  monthlyUsage: '1,000',
  purchasePrice: '250,000.00',
  financingEnabled: true,
  financedAmount: '150,000.00',
  annualInterestRate: '24.5',
  termMonths: '24',
  loanFees: '1,500.00',
  maintenanceAnnual: '12,000.00',
  fuelConsumption: '3.5',
  fuelUnitPrice: '45.50',
  residualValue: '150,000.00',
  sellingCosts: '2,000.00',
  notes: '',
};

describe('wizard form schema', () => {
  it('accepts English localized entries', () => {
    expect(createWizardFormSchema('en').safeParse(validValues).success).toBe(true);
  });

  it('accepts Turkish localized entries', () => {
    expect(
      createWizardFormSchema('tr').safeParse({
        ...validValues,
        monthlyUsage: '1.000',
        purchasePrice: '250.000,00',
        financedAmount: '150.000,00',
        annualInterestRate: '24,5',
        loanFees: '1.500,00',
        maintenanceAnnual: '12.000,00',
        fuelConsumption: '3,5',
        fuelUnitPrice: '45,50',
        residualValue: '150.000,00',
        sellingCosts: '2.000,00',
      }).success,
    ).toBe(true);
  });

  it('rejects missing purchase price and incomplete enabled financing', () => {
    const result = createWizardFormSchema('en').safeParse({
      ...validValues,
      purchasePrice: '0',
      financedAmount: '0',
      termMonths: '0',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      expect(paths).toEqual(
        expect.arrayContaining(['purchasePrice', 'financedAmount', 'termMonths']),
      );
    }
  });
});
