import { Decimal } from 'decimal.js';

import type { AppLocale } from '@/i18n';

const localeTags: Record<AppLocale, string> = { tr: 'tr-TR', en: 'en-US' };

export function getLocaleTag(locale: AppLocale): string {
  return localeTags[locale];
}

export function formatNumber(
  value: number,
  locale: AppLocale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(getLocaleTag(locale), options).format(value);
}

export function formatCurrency(value: number, currency: string, locale: AppLocale): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatMinorCurrency(
  minorValue: string,
  currency: string,
  locale: AppLocale,
  fractionDigits = 2,
): string {
  const formatter = new Intl.NumberFormat(getLocaleTag(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const decimal = new Decimal(minorValue).dividedBy(new Decimal(10).pow(fractionDigits));

  // ECMA-402 accepts a decimal string and preserves its precision; TypeScript's lib type is narrower.
  return formatter.format(decimal.toFixed(fractionDigits) as unknown as number);
}

export function formatLocalizedMoneyInput(
  input: string,
  locale: AppLocale,
  fractionDigits = 2,
): string | null {
  const normalized = normalizeLocalizedDecimal(input, locale);
  if (normalized === null) return null;
  const formatter = new Intl.NumberFormat(getLocaleTag(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return formatter.format(new Decimal(normalized).toFixed(fractionDigits) as unknown as number);
}

export function formatMinorForInput(
  minorValue: string,
  locale: AppLocale,
  fractionDigits = 2,
): string {
  const formatter = new Intl.NumberFormat(getLocaleTag(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const decimal = new Decimal(minorValue).dividedBy(new Decimal(10).pow(fractionDigits));
  return formatter.format(decimal.toFixed(fractionDigits) as unknown as number);
}

export function parseLocalizedNumber(input: string, locale: AppLocale): number | null {
  const normalized = normalizeLocalizedDecimal(input, locale);
  if (normalized === null) return null;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function normalizeLocalizedDecimal(input: string, locale: AppLocale): string | null {
  const parts = new Intl.NumberFormat(getLocaleTag(locale)).formatToParts(12345.6);
  const group = parts.find((part) => part.type === 'group')?.value ?? ',';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const normalized = input
    .trim()
    .replaceAll(/\s/g, '')
    .replaceAll(group, '')
    .replace(decimal, '.')
    .replaceAll(/[^0-9+.-]/g, '');

  return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized) ? normalized : null;
}
