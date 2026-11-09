import { z } from 'zod';

import type { AppLocale } from '@/i18n';
import { parseLocalizedNumber } from '@/utils/format';
import { parseLocalizedMoneyMinor } from '@/utils/parse-money';

export const costFrequencies = ['monthly', 'quarterly', 'semiannual', 'annual'] as const;
export type CostFrequency = (typeof costFrequencies)[number];

export const wizardStepFields = [
  ['title', 'ownershipMonths', 'monthlyUsage'],
  ['purchasePrice', 'initialCosts'],
  ['financingEnabled', 'financedAmount', 'annualInterestRate', 'termMonths', 'loanFees'],
  ['recurringCosts', 'energyConsumption', 'energyUnitPrice'],
  ['residualValue', 'sellingCosts'],
  ['notes'],
  [],
] as const;

const moneyField = (locale: AppLocale, required = false) =>
  z.string().superRefine((value, context) => {
    const minor = parseLocalizedMoneyMinor(value, locale);
    if (minor === null || Number(minor) < 0 || (required && minor === '0')) {
      context.addIssue({ code: 'custom', message: required ? 'positive' : 'nonnegative' });
    }
  });

const numberField = (
  locale: AppLocale,
  options: { positive?: boolean; max?: number; integer?: boolean } = {},
) =>
  z.string().superRefine((value, context) => {
    const parsed = parseLocalizedNumber(value, locale);
    if (
      parsed === null ||
      parsed < 0 ||
      (options.positive && parsed <= 0) ||
      (options.max !== undefined && parsed > options.max) ||
      (options.integer && !Number.isInteger(parsed))
    ) {
      context.addIssue({ code: 'custom', message: options.positive ? 'positive' : 'nonnegative' });
    }
  });

/**
 * One editable cost line. Template lines carry a `key` and a translated label; custom lines
 * have an empty `key` and a user-entered `label`. `itemId` becomes the persisted cost item id.
 */
const costRowSchema = (locale: AppLocale) =>
  z
    .object({
      itemId: z.string().min(1),
      key: z.string(),
      label: z.string().max(80),
      frequency: z.enum(costFrequencies),
      amount: moneyField(locale),
      removable: z.boolean(),
    })
    .superRefine((row, context) => {
      if (row.key === '' && row.label.trim().length === 0) {
        context.addIssue({ code: 'custom', path: ['label'], message: 'required' });
      }
    });

export type CostRowValues = z.infer<ReturnType<typeof costRowSchema>>;

export function createWizardFormSchema(locale: AppLocale) {
  return z
    .object({
      title: z.string().trim().min(1).max(120),
      ownershipMonths: numberField(locale, { positive: true, max: 600, integer: true }),
      monthlyUsage: numberField(locale),
      purchasePrice: moneyField(locale, true),
      initialCosts: z.array(costRowSchema(locale)).max(40),
      financingEnabled: z.boolean(),
      financedAmount: moneyField(locale),
      annualInterestRate: numberField(locale, { max: 1000 }),
      termMonths: numberField(locale, { max: 600, integer: true }),
      loanFees: moneyField(locale),
      recurringCosts: z.array(costRowSchema(locale)).max(40),
      energyConsumption: numberField(locale, { max: 100000 }),
      energyUnitPrice: moneyField(locale),
      residualValue: moneyField(locale),
      sellingCosts: moneyField(locale),
      notes: z.string().max(1000),
    })
    .superRefine((values, context) => {
      if (!values.financingEnabled) return;
      const financed = parseLocalizedMoneyMinor(values.financedAmount, locale);
      const term = parseLocalizedNumber(values.termMonths, locale);
      if (!financed || financed === '0') {
        context.addIssue({ code: 'custom', path: ['financedAmount'], message: 'positive' });
      }
      if (!term || term < 1 || !Number.isInteger(term)) {
        context.addIssue({ code: 'custom', path: ['termMonths'], message: 'positive' });
      }
    });
}

export type WizardFormValues = z.infer<ReturnType<typeof createWizardFormSchema>>;

/** Guards drafts persisted by earlier app versions, which used a different field shape. */
export function isWizardFormValues(value: unknown): value is WizardFormValues {
  if (!value || typeof value !== 'object') return false;
  const draft = value as Partial<Record<keyof WizardFormValues, unknown>>;
  return (
    typeof draft.title === 'string' &&
    Array.isArray(draft.initialCosts) &&
    Array.isArray(draft.recurringCosts) &&
    typeof draft.energyConsumption === 'string' &&
    typeof draft.energyUnitPrice === 'string'
  );
}
