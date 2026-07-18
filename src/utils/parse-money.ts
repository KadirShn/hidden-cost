import { Decimal } from 'decimal.js';

import type { AppLocale } from '@/i18n';
import { normalizeLocalizedDecimal } from '@/utils/format';

export function parseLocalizedMoneyMinor(
  input: string,
  locale: AppLocale,
  fractionDigits = 2,
): string | null {
  if (!Number.isInteger(fractionDigits) || fractionDigits < 0) {
    throw new RangeError('Fraction digits must be a non-negative integer');
  }

  const normalized = normalizeLocalizedDecimal(input, locale);
  if (normalized === null) return null;

  return new Decimal(normalized)
    .times(new Decimal(10).pow(fractionDigits))
    .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
    .toFixed(0);
}
