import { describe, expect, it } from '@jest/globals';

import { createWizardFormSchema } from './form-schema';

const row = {
  itemId: 'row-1',
  key: 'maintenance',
  label: '',
  frequency: 'annual' as const,
  amount: '12,000.00',
  removable: false,
};

const validValues = {
  title: 'Motorcycle',
  ownershipMonths: '36',
  monthlyUsage: '1,000',
  purchasePrice: '250,000.00',
  initialCosts: [],
  financingEnabled: true,
  financedAmount: '150,000.00',
  annualInterestRate: '24.5',
  termMonths: '24',
  loanFees: '1,500.00',
  recurringCosts: [row],
  energyConsumption: '3.5',
  energyUnitPrice: '45.50',
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
        recurringCosts: [{ ...row, amount: '12.000,00' }],
        energyConsumption: '3,5',
        energyUnitPrice: '45,50',
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

  it('requires a name for custom cost lines and valid line amounts', () => {
    const result = createWizardFormSchema('en').safeParse({
      ...validValues,
      initialCosts: [{ ...row, itemId: 'custom', key: '', label: '  ', amount: '-5' }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toEqual(
        expect.arrayContaining(['initialCosts.0.label', 'initialCosts.0.amount']),
      );
    }
  });
});
