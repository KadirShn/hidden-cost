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

export function parseLocalizedNumber(input: string, locale: AppLocale): number | null {
  const parts = new Intl.NumberFormat(getLocaleTag(locale)).formatToParts(12345.6);
  const group = parts.find((part) => part.type === 'group')?.value ?? ',';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const normalized = input
    .trim()
    .replaceAll(/\s/g, '')
    .replaceAll(group, '')
    .replace(decimal, '.')
    .replaceAll(/[^0-9+.-]/g, '');

  if (!normalized) return null;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
