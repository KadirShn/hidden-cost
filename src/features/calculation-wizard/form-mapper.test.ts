import { describe, expect, it } from '@jest/globals';

import type { ProjectBundle } from '@/data/repositories/types';
import { seedTemplates } from '@/data/templates/seed-templates';
import { calculateCostProject } from '@/domain';

import { getEnergyProfile } from './energy-profile';
import {
  createCustomCostRow,
  createProjectDraft,
  formToProjectBundle,
  projectBundleToForm,
} from './form-mapper';
import { createWizardFormSchema, isWizardFormValues, type WizardFormValues } from './form-schema';

const NOW = '2026-01-01T00:00:00.000Z';
const labels = { item: (key: string) => `label:${key}` };

function setup(templateId: string) {
  const template = seedTemplates.find((item) => item.id === templateId)!;
  const project = createProjectDraft(template, `Test ${templateId}`, NOW);
  const bundle: ProjectBundle = { project, costItems: [], scenarioOverrides: [] };
  const profile = getEnergyProfile(project);
  let sequence = 0;
  const values = projectBundleToForm(bundle, template, profile, 'tr', () => `row-${++sequence}`);
  return { template, bundle, profile, values };
}

function setAmount(
  values: WizardFormValues,
  list: 'initialCosts' | 'recurringCosts',
  key: string,
  amount: string,
) {
  const row = values[list].find((item) => item.key === key);
  if (!row) throw new Error(`Missing row ${key}`);
  row.amount = amount;
}

describe('wizard form mapping', () => {
  it('maps purchase, financing, template lines, fuel and residual value into the domain', () => {
    const { bundle, profile, values } = setup('motorcycle');
    setAmount(values, 'recurringCosts', 'maintenance', '12.000,00');
    const filled: WizardFormValues = {
      ...values,
      ownershipMonths: '36',
      monthlyUsage: '1.000',
      purchasePrice: '300.000,00',
      financingEnabled: true,
      financedAmount: '200.000,00',
      annualInterestRate: '0',
      termMonths: '24',
      loanFees: '1.000,00',
      energyConsumption: '4',
      energyUnitPrice: '50,00',
      residualValue: '180.000,00',
      sellingCosts: '2.000,00',
    };

    const next = formToProjectBundle(filled, bundle, 'tr', labels, profile, NOW);
    const result = calculateCostProject({ project: next.project, costItems: next.costItems });

    expect(next.project.purchasePriceMinor).toBe('30000000');
    expect(next.project.financing?.downPaymentMinor).toBe('10000000');
    expect(next.costItems.find((item) => item.key === 'fuel')?.unitPriceMinor).toBe('5000');
    expect(result.financingSummary?.interestCostMinor).toBe('0');
    expect(result.totalCostMinor).toBe('23100000');
  });

  it('offers every template line and only persists the ones with an amount', () => {
    const { template, bundle, profile, values } = setup('car');
    const templateKeys = template.recommendedItems
      .filter((item) => item.type !== 'usage')
      .map((item) => item.key);

    expect([...values.initialCosts, ...values.recurringCosts].map((row) => row.key)).toEqual(
      templateKeys,
    );
    expect(values.recurringCosts.find((row) => row.key === 'vehicle_tax')?.frequency).toBe(
      'semiannual',
    );

    setAmount(values, 'initialCosts', 'registration', '5.000,00');
    setAmount(values, 'recurringCosts', 'comprehensive_insurance', '24.000,00');
    setAmount(values, 'recurringCosts', 'vehicle_tax', '3.000,00');
    const next = formToProjectBundle(
      { ...values, purchasePrice: '1.000.000,00', ownershipMonths: '12' },
      bundle,
      'tr',
      labels,
      profile,
      NOW,
    );

    expect(next.costItems.map((item) => item.key).sort()).toEqual(
      ['comprehensive_insurance', 'registration', 'vehicle_tax'].sort(),
    );
    expect(next.costItems.find((item) => item.key === 'registration')).toMatchObject({
      type: 'initial',
      label: 'label:registration',
      isEnabled: true,
    });
    const result = calculateCostProject({ project: next.project, costItems: next.costItems });
    // 1,000,000 + 5,000 + 24,000 (annual x 12 months) + 3,000 x 2 (semiannual x 12 months)
    expect(result.totalCostMinor).toBe('103500000');
  });

  it('round-trips saved lines, keeps ids stable and soft-deletes removed custom lines', () => {
    const { template, bundle, profile, values } = setup('subscription');
    expect(profile).toBeNull();
    setAmount(values, 'recurringCosts', 'subscription_fee', '200,00');
    const custom = { ...createCustomCostRow('tr', 'annual', () => 'custom-1'), label: 'Domain' };
    custom.amount = '600,00';
    values.recurringCosts.push(custom);

    const first = formToProjectBundle(values, bundle, 'tr', labels, profile, NOW);
    expect(first.costItems.find((item) => item.id === 'custom-1')).toMatchObject({
      label: 'Domain',
      frequency: 'annual',
      key: undefined,
    });
    expect(first.costItems.some((item) => item.type === 'usage')).toBe(false);

    const reopened = projectBundleToForm(first, template, profile, 'tr', () => 'unused');
    expect(reopened.recurringCosts.find((row) => row.itemId === 'custom-1')).toMatchObject({
      label: 'Domain',
      removable: true,
    });
    const fee = first.costItems.find((item) => item.key === 'subscription_fee')!;
    expect(reopened.recurringCosts.find((row) => row.key === 'subscription_fee')?.itemId).toBe(
      fee.id,
    );

    const withoutCustom = {
      ...reopened,
      recurringCosts: reopened.recurringCosts.filter((row) => row.itemId !== 'custom-1'),
    };
    const second = formToProjectBundle(withoutCustom, first, 'tr', labels, profile, NOW);
    expect(second.costItems.find((item) => item.id === 'custom-1')?.deletedAt).toBe(NOW);
    const result = calculateCostProject({
      project: second.project,
      costItems: second.costItems,
    });
    // 12 months x 200 only: the removed custom line no longer counts.
    expect(result.totalCostMinor).toBe('240000');
  });

  it('converts boat fuel from liters per hour', () => {
    const { bundle, profile, values } = setup('boat');
    expect(profile?.kind).toBe('fuel_hourly');
    const next = formToProjectBundle(
      {
        ...values,
        purchasePrice: '1,00',
        ownershipMonths: '10',
        monthlyUsage: '20',
        energyConsumption: '2,5',
        energyUnitPrice: '40,00',
      },
      bundle,
      'tr',
      labels,
      profile,
      NOW,
    );
    const fuel = next.costItems.find((item) => item.key === 'fuel')!;
    expect(fuel.consumptionPer100Units).toBe(250);
    const result = calculateCostProject({ project: next.project, costItems: next.costItems });
    // 1 + 200 hours x 2.5 L x 40 = 20,001
    expect(result.totalCostMinor).toBe('2000100');
    expect(projectBundleToForm(next, null, profile, 'tr').energyConsumption).toBe('2.5');
  });

  it('derives electronics electricity from device wattage and hourly usage', () => {
    const { bundle, profile, values } = setup('electronics');
    expect(bundle.project.usageUnit).toBe('hour');
    expect(profile?.kind).toBe('electric_power');
    const next = formToProjectBundle(
      {
        ...values,
        purchasePrice: '1,00',
        ownershipMonths: '12',
        monthlyUsage: '100',
        energyConsumption: '500',
        energyUnitPrice: '3,00',
      },
      bundle,
      'tr',
      labels,
      profile,
      NOW,
    );
    const electricity = next.costItems.find((item) => item.key === 'electricity')!;
    expect(electricity).toMatchObject({ unit: 'kwh', consumptionPer100Units: 50 });
    const result = calculateCostProject({ project: next.project, costItems: next.costItems });
    // 1 + 1,200 hours x 0.5 kWh x 3 = 1,801
    expect(result.totalCostMinor).toBe('180100');
  });

  it('produces values accepted by the form schema and rejects legacy drafts', () => {
    const { values } = setup('car');
    const parsed = createWizardFormSchema('tr').safeParse({ ...values, purchasePrice: '10,00' });
    expect(parsed.success).toBe(true);
    expect(isWizardFormValues(values)).toBe(true);
    expect(isWizardFormValues({ title: 'Old', maintenanceAnnual: '0' })).toBe(false);
  });
});
