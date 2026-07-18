import { describe, expect, it } from '@jest/globals';

import { formatCurrency, formatNumber, parseLocalizedNumber } from '@/utils/format';

describe('locale-aware presentation formatting', () => {
  it('formats currency for Turkish and English locales', () => {
    expect(formatCurrency(1234.5, 'TRY', 'tr')).toContain('1.234,50');
    expect(formatCurrency(1234.5, 'USD', 'en')).toContain('1,234.50');
  });

  it('parses localized decimal input', () => {
    expect(parseLocalizedNumber('1.234,50', 'tr')).toBe(1234.5);
    expect(parseLocalizedNumber('1,234.50', 'en')).toBe(1234.5);
  });

  it('uses locale-specific grouping', () => {
    expect(formatNumber(12000, 'tr')).toBe('12.000');
    expect(formatNumber(12000, 'en')).toBe('12,000');
  });
});
