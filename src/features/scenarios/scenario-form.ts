import { z } from 'zod';

import type { ProjectBundle, ScenarioOverrideRecord } from '@/data/repositories/types';
import type { AppLocale } from '@/i18n';
import { formatMinorForInput, parseLocalizedNumber } from '@/utils/format';
import { createEntityId } from '@/utils/id';
import { parseLocalizedMoneyMinor } from '@/utils/parse-money';

export type ScenarioFormValues = {
  monthlyUsage: string;
  maintenanceAmount: string;
  fuelUnitPrice: string;
  residualValue: string;
  interestRate: string;
};

export function createScenarioFormSchema(locale: AppLocale) {
  const number = z.string().refine((value) => {
    const parsed = parseLocalizedNumber(value, locale);
    return parsed !== null && parsed >= 0;
  });
  const money = z.string().refine((value) => {
    const parsed = parseLocalizedMoneyMinor(value, locale);
    return parsed !== null && !parsed.startsWith('-');
  });
  return z.object({
    monthlyUsage: number,
    maintenanceAmount: money,
    fuelUnitPrice: money,
    residualValue: money,
    interestRate: number,
  });
}

export type ScenarioFieldDefinition = {
  key: keyof ScenarioFormValues;
  path: string;
  kind: 'money' | 'number';
  labelKey: string;
};

function findEnergyItem(bundle: ProjectBundle) {
  return bundle.costItems.find(
    (item) =>
      item.type === 'usage' &&
      (item.key === 'fuel' || item.key === 'electricity') &&
      item.unitPriceMinor !== undefined &&
      !item.deletedAt,
  );
}

export function getScenarioFields(bundle: ProjectBundle): ScenarioFieldDefinition[] {
  const fields: ScenarioFieldDefinition[] = [
    {
      key: 'monthlyUsage',
      path: 'project.usagePerMonth',
      kind: 'number',
      labelKey: 'scenarios.fields.monthlyUsage',
    },
  ];
  const maintenance = bundle.costItems.find((item) => item.key === 'maintenance');
  const energy = findEnergyItem(bundle);
  if (maintenance) {
    fields.push({
      key: 'maintenanceAmount',
      path: `costItem.${maintenance.id}.amountMinor`,
      kind: 'money',
      labelKey: 'scenarios.fields.maintenance',
    });
  }
  if (energy) {
    fields.push({
      key: 'fuelUnitPrice',
      path: `costItem.${energy.id}.unitPriceMinor`,
      kind: 'money',
      labelKey:
        energy.key === 'electricity'
          ? 'scenarios.fields.electricityPrice'
          : 'scenarios.fields.fuelPrice',
    });
  }
  if (bundle.project.residualValue?.mode === 'fixed') {
    fields.push({
      key: 'residualValue',
      path: 'residualValue.fixedAmountMinor',
      kind: 'money',
      labelKey: 'scenarios.fields.residualValue',
    });
  }
  if (bundle.project.financing?.enabled) {
    fields.push({
      key: 'interestRate',
      path: 'financing.annualInterestRate',
      kind: 'number',
      labelKey: 'scenarios.fields.interestRate',
    });
  }
  return fields;
}

function baseValue(bundle: ProjectBundle, field: ScenarioFieldDefinition): string | number {
  switch (field.key) {
    case 'monthlyUsage':
      return bundle.project.usagePerMonth ?? 0;
    case 'maintenanceAmount':
      return bundle.costItems.find((item) => item.key === 'maintenance')?.amountMinor ?? '0';
    case 'fuelUnitPrice':
      return findEnergyItem(bundle)?.unitPriceMinor ?? '0';
    case 'residualValue':
      return bundle.project.residualValue?.fixedAmountMinor ?? '0';
    case 'interestRate':
      return bundle.project.financing?.annualInterestRate ?? 0;
  }
}

export function scenarioToForm(
  bundle: ProjectBundle,
  records: ScenarioOverrideRecord[],
  scenario: ScenarioOverrideRecord['scenario'],
  locale: AppLocale,
): ScenarioFormValues {
  const values: ScenarioFormValues = {
    monthlyUsage: '0',
    maintenanceAmount: formatMinorForInput('0', locale),
    fuelUnitPrice: formatMinorForInput('0', locale),
    residualValue: formatMinorForInput('0', locale),
    interestRate: '0',
  };
  for (const field of getScenarioFields(bundle)) {
    const override = records.find(
      (record) => record.scenario === scenario && record.path === field.path,
    );
    const value = override?.value ?? baseValue(bundle, field);
    values[field.key] =
      field.kind === 'money' ? formatMinorForInput(String(value), locale) : String(value);
  }
  return values;
}

export function formToScenarioOverrides(
  bundle: ProjectBundle,
  values: ScenarioFormValues,
  scenario: ScenarioOverrideRecord['scenario'],
  locale: AppLocale,
  now = new Date().toISOString(),
): ScenarioOverrideRecord[] {
  return getScenarioFields(bundle).map((field) => ({
    id: createEntityId('scenario'),
    projectId: bundle.project.id,
    scenario,
    path: field.path,
    value:
      field.kind === 'money'
        ? (parseLocalizedMoneyMinor(values[field.key], locale) ?? '0')
        : (parseLocalizedNumber(values[field.key], locale) ?? 0),
    createdAt: now,
    updatedAt: now,
  }));
}

export function scenarioPathLabelKey(path: string): string {
  if (path === 'project.usagePerMonth') return 'scenarios.fields.monthlyUsage';
  if (path.includes('.amountMinor')) return 'scenarios.fields.maintenance';
  if (path.includes('.unitPriceMinor')) return 'scenarios.fields.fuelPrice';
  if (path === 'residualValue.fixedAmountMinor') return 'scenarios.fields.residualValue';
  if (path === 'financing.annualInterestRate') return 'scenarios.fields.interestRate';
  return 'scenarios.fields.other';
}
