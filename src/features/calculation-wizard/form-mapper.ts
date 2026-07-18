import { Decimal } from 'decimal.js';

import type { ProjectBundle, TemplateDefinition } from '@/data/repositories/types';
import type { CostItem, CostProject } from '@/domain';
import type { AppLocale } from '@/i18n';
import { formatMinorForInput, parseLocalizedNumber } from '@/utils/format';
import { createEntityId } from '@/utils/id';
import { parseLocalizedMoneyMinor } from '@/utils/parse-money';

import type { WizardFormValues } from './form-schema';

const emptyAssumptions = { base: {}, lowOverrides: {}, highOverrides: {} } as const;

export function createProjectDraft(
  template: TemplateDefinition,
  title: string,
  now = new Date().toISOString(),
): CostProject {
  return {
    id: createEntityId('project'),
    localOwnerId: 'local-device-owner',
    title,
    category: template.category,
    templateId: template.id,
    templateVersion: template.version,
    currency: template.defaultCurrency,
    purchasePriceMinor: '0',
    ownershipMonths: template.defaultOwnershipMonths,
    usagePerMonth: 0,
    usageUnit: template.usageUnit,
    status: 'draft',
    assumptions: emptyAssumptions,
    createdAt: now,
    updatedAt: now,
    syncStatus: 'local_only',
    schemaVersion: 1,
  };
}

export function projectBundleToForm(bundle: ProjectBundle, locale: AppLocale): WizardFormValues {
  const maintenance = bundle.costItems.find((item) => item.key === 'maintenance');
  const fuel = bundle.costItems.find((item) => item.key === 'fuel');
  const financing = bundle.project.financing;
  const residual = bundle.project.residualValue;
  const money = (minor?: string) => formatMinorForInput(minor ?? '0', locale);

  return {
    title: bundle.project.title,
    ownershipMonths: String(bundle.project.ownershipMonths),
    monthlyUsage: String(bundle.project.usagePerMonth ?? 0),
    purchasePrice: money(bundle.project.purchasePriceMinor),
    financingEnabled: financing?.enabled ?? false,
    financedAmount: money(financing?.financedAmountMinor),
    annualInterestRate: String(financing?.annualInterestRate ?? 0),
    termMonths: String(financing?.termMonths ?? 0),
    loanFees: money(financing?.loanFeesMinor),
    maintenanceAnnual: money(maintenance?.amountMinor),
    fuelConsumption: String(fuel?.consumptionPer100Units ?? 0),
    fuelUnitPrice: money(fuel?.unitPriceMinor),
    residualValue: money(residual?.fixedAmountMinor),
    sellingCosts: money(residual?.sellingCostsMinor),
    notes: bundle.project.notes ?? '',
  };
}

type CostItemLabels = { maintenance: string; fuel: string };

export function formToProjectBundle(
  values: WizardFormValues,
  current: ProjectBundle,
  locale: AppLocale,
  labels: CostItemLabels,
  now = new Date().toISOString(),
): ProjectBundle {
  const minor = (value: string) => parseLocalizedMoneyMinor(value, locale) ?? '0';
  const number = (value: string) => parseLocalizedNumber(value, locale) ?? 0;
  const purchaseMinor = minor(values.purchasePrice);
  const financedMinor = minor(values.financedAmount);
  const downPaymentMinor = Decimal.max(new Decimal(purchaseMinor).minus(financedMinor), 0).toFixed(
    0,
  );
  const existingItem = (key: string) => current.costItems.find((item) => item.key === key);
  const baseItem = (key: string, label: string, sortOrder: number): Omit<CostItem, 'type'> => ({
    id: existingItem(key)?.id ?? createEntityId('cost-item'),
    projectId: current.project.id,
    key,
    label,
    isTemplateDefault: false,
    isEnabled: true,
    sortOrder,
    createdAt: existingItem(key)?.createdAt ?? now,
    updatedAt: now,
  });

  const maintenance: CostItem = {
    ...baseItem('maintenance', labels.maintenance, 50),
    type: 'recurring',
    amountMinor: minor(values.maintenanceAnnual),
    frequency: 'annual',
    isEnabled: minor(values.maintenanceAnnual) !== '0',
  };
  const fuel: CostItem = {
    ...baseItem('fuel', labels.fuel, 90),
    type: 'usage',
    unit: 'liter',
    consumptionPer100Units: number(values.fuelConsumption),
    unitPriceMinor: minor(values.fuelUnitPrice),
    isEnabled: number(values.fuelConsumption) > 0 && minor(values.fuelUnitPrice) !== '0',
  };
  const otherItems = current.costItems.filter(
    (item) => item.key !== 'maintenance' && item.key !== 'fuel',
  );
  const project: CostProject = {
    ...current.project,
    title: values.title.trim(),
    purchasePriceMinor: purchaseMinor,
    ownershipMonths: Math.round(number(values.ownershipMonths)),
    usagePerMonth: number(values.monthlyUsage),
    financing: values.financingEnabled
      ? {
          enabled: true,
          downPaymentMinor,
          financedAmountMinor: financedMinor,
          annualInterestRate: number(values.annualInterestRate),
          termMonths: Math.round(number(values.termMonths)),
          loanFeesMinor: minor(values.loanFees),
        }
      : undefined,
    residualValue:
      minor(values.residualValue) !== '0' || minor(values.sellingCosts) !== '0'
        ? {
            mode: 'fixed',
            fixedAmountMinor: minor(values.residualValue),
            sellingCostsMinor: minor(values.sellingCosts),
          }
        : undefined,
    notes: values.notes.trim() || undefined,
    updatedAt: now,
    syncStatus: 'pending',
  };

  return { project, costItems: [...otherItems, maintenance, fuel], scenarioOverrides: [] };
}
