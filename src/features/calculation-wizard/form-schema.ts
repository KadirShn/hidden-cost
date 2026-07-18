import { z } from 'zod';

import type { AppLocale } from '@/i18n';
import { parseLocalizedNumber } from '@/utils/format';
import { parseLocalizedMoneyMinor } from '@/utils/parse-money';

export const wizardStepFields = [
  ['title', 'ownershipMonths', 'monthlyUsage'],
  ['purchasePrice'],
  ['financingEnabled', 'financedAmount', 'annualInterestRate', 'termMonths', 'loanFees'],
  ['maintenanceAnnual'],
  ['fuelConsumption', 'fuelUnitPrice'],
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

export function createWizardFormSchema(locale: AppLocale) {
  return z
    .object({
      title: z.string().trim().min(1).max(120),
      ownershipMonths: numberField(locale, { positive: true, max: 600, integer: true }),
      monthlyUsage: numberField(locale),
      purchasePrice: moneyField(locale, true),
      financingEnabled: z.boolean(),
      financedAmount: moneyField(locale),
      annualInterestRate: numberField(locale, { max: 1000 }),
      termMonths: numberField(locale, { max: 600, integer: true }),
      loanFees: moneyField(locale),
      maintenanceAnnual: moneyField(locale),
      fuelConsumption: numberField(locale, { max: 1000 }),
      fuelUnitPrice: moneyField(locale),
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
