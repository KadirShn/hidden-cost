import { Decimal } from 'decimal.js';

import type { ProjectBundle, TemplateDefinition } from '@/data/repositories/types';
import type { CostItem, CostProject } from '@/domain';
import type { AppLocale } from '@/i18n';
import { formatMinorForInput, parseLocalizedNumber } from '@/utils/format';
import { createEntityId } from '@/utils/id';
import { parseLocalizedMoneyMinor } from '@/utils/parse-money';

import { consumptionFromStored, consumptionToStored, type EnergyProfile } from './energy-profile';

import type { CostRowValues, WizardFormValues } from './form-schema';

const emptyAssumptions = { base: {}, lowOverrides: {}, highOverrides: {} } as const;

type RowCostType = 'initial' | 'recurring';

const sortOrderBase: Record<RowCostType, number> = { initial: 100, recurring: 300 };
const energySortOrder = 900;

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

const isLive = (item: CostItem) => !item.deletedAt;

/**
 * Builds editable rows for one cost type: every template-recommended line first (matched to an
 * existing item by key when present), then any other saved line that still carries a value.
 */
function buildCostRows(
  type: RowCostType,
  bundle: ProjectBundle,
  template: TemplateDefinition | null,
  locale: AppLocale,
  createId: () => string,
): CostRowValues[] {
  const money = (minor?: string) => formatMinorForInput(minor ?? '0', locale);
  const saved = bundle.costItems
    .filter((item) => item.type === type && isLive(item))
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const matched = new Set<string>();
  const rows: CostRowValues[] = [];

  const recommended = (template?.recommendedItems ?? [])
    .filter((item) => item.type === type)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  for (const recommendation of recommended) {
    const existing = saved.find((item) => item.key === recommendation.key && !matched.has(item.id));
    if (existing) matched.add(existing.id);
    rows.push({
      itemId: existing?.id ?? createId(),
      key: recommendation.key,
      label: existing?.label ?? '',
      frequency: existing?.frequency ?? recommendation.frequency ?? 'monthly',
      amount: money(existing?.amountMinor),
      removable: false,
    });
  }

  for (const item of saved) {
    if (matched.has(item.id)) continue;
    if (!item.isEnabled && (item.amountMinor ?? '0') === '0') continue;
    rows.push({
      itemId: item.id,
      key: item.key ?? '',
      label: item.label,
      frequency: item.frequency ?? 'monthly',
      amount: money(item.amountMinor),
      removable: true,
    });
  }
  return rows;
}

export function createCustomCostRow(
  locale: AppLocale,
  frequency: CostRowValues['frequency'] = 'monthly',
  createId: () => string = () => createEntityId('cost-item'),
): CostRowValues {
  return {
    itemId: createId(),
    key: '',
    label: '',
    frequency,
    amount: formatMinorForInput('0', locale),
    removable: true,
  };
}

export function projectBundleToForm(
  bundle: ProjectBundle,
  template: TemplateDefinition | null,
  energyProfile: EnergyProfile | null,
  locale: AppLocale,
  createId: () => string = () => createEntityId('cost-item'),
): WizardFormValues {
  const financing = bundle.project.financing;
  const residual = bundle.project.residualValue;
  const money = (minor?: string) => formatMinorForInput(minor ?? '0', locale);
  const energyItem = energyProfile
    ? bundle.costItems.find(
        (item) => item.type === 'usage' && item.key === energyProfile.itemKey && isLive(item),
      )
    : undefined;

  return {
    title: bundle.project.title,
    ownershipMonths: String(bundle.project.ownershipMonths),
    monthlyUsage: String(bundle.project.usagePerMonth ?? 0),
    purchasePrice: money(bundle.project.purchasePriceMinor),
    initialCosts: buildCostRows('initial', bundle, template, locale, createId),
    financingEnabled: financing?.enabled ?? false,
    financedAmount: money(financing?.financedAmountMinor),
    annualInterestRate: String(financing?.annualInterestRate ?? 0),
    termMonths: String(financing?.termMonths ?? 0),
    loanFees: money(financing?.loanFeesMinor),
    recurringCosts: buildCostRows('recurring', bundle, template, locale, createId),
    energyConsumption: String(
      energyProfile && energyItem?.consumptionPer100Units !== undefined
        ? consumptionFromStored(energyProfile, energyItem.consumptionPer100Units)
        : 0,
    ),
    energyUnitPrice: money(energyItem?.unitPriceMinor),
    residualValue: money(residual?.fixedAmountMinor),
    sellingCosts: money(residual?.sellingCostsMinor),
    notes: bundle.project.notes ?? '',
  };
}

export type CostItemLabels = {
  /** Translated label for a template cost key, e.g. `comprehensive_insurance`. */
  item: (key: string) => string;
};

export function formToProjectBundle(
  values: WizardFormValues,
  current: ProjectBundle,
  locale: AppLocale,
  labels: CostItemLabels,
  energyProfile: EnergyProfile | null,
  now = new Date().toISOString(),
): ProjectBundle {
  const minor = (value: string) => parseLocalizedMoneyMinor(value, locale) ?? '0';
  const number = (value: string) => parseLocalizedNumber(value, locale) ?? 0;
  const projectId = current.project.id;
  const purchaseMinor = minor(values.purchasePrice);
  const financedMinor = minor(values.financedAmount);
  const downPaymentMinor = Decimal.max(new Decimal(purchaseMinor).minus(financedMinor), 0).toFixed(
    0,
  );
  const liveItems = current.costItems.filter(isLive);
  const findLive = (id: string) => liveItems.find((item) => item.id === id);
  const handled = new Map<string, CostItem>();

  const mapRows = (rows: readonly CostRowValues[], type: RowCostType) => {
    rows.forEach((row, index) => {
      const amountMinor = minor(row.amount);
      const existing = findLive(row.itemId);
      if (amountMinor === '0' && !existing) return;
      const label = row.key ? labels.item(row.key) : row.label.trim();
      handled.set(row.itemId, {
        ...existing,
        id: row.itemId,
        projectId,
        type,
        key: row.key || undefined,
        label: label || existing?.label || row.key,
        amountMinor,
        frequency: type === 'recurring' ? row.frequency : undefined,
        isTemplateDefault: false,
        isEnabled: amountMinor !== '0',
        sortOrder: sortOrderBase[type] + index * 10,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    });
  };
  mapRows(values.initialCosts, 'initial');
  mapRows(values.recurringCosts, 'recurring');

  // Lines the user removed from the form are soft-deleted so the sync queue sees the change.
  for (const item of liveItems) {
    if (item.type === 'usage' || handled.has(item.id) || !item.isEnabled) continue;
    handled.set(item.id, { ...item, isEnabled: false, deletedAt: now, updatedAt: now });
  }

  if (energyProfile) {
    const existing = liveItems.find(
      (item) => item.type === 'usage' && item.key === energyProfile.itemKey,
    );
    const consumption = number(values.energyConsumption);
    const unitPriceMinor = minor(values.energyUnitPrice);
    if (existing || consumption > 0 || unitPriceMinor !== '0') {
      const id = existing?.id ?? createEntityId('cost-item');
      handled.set(id, {
        ...existing,
        id,
        projectId,
        type: 'usage',
        key: energyProfile.itemKey,
        label: labels.item(energyProfile.itemKey),
        unit: energyProfile.unit,
        consumptionPer100Units: consumptionToStored(energyProfile, consumption),
        unitPriceMinor,
        isTemplateDefault: false,
        isEnabled: consumption > 0 && unitPriceMinor !== '0',
        sortOrder: energySortOrder,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      });
    }
  }

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

  const untouched = current.costItems.filter((item) => !handled.has(item.id));
  return {
    project,
    costItems: [...untouched, ...handled.values()],
    scenarioOverrides: [],
  };
}
