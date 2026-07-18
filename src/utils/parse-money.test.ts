import { describe, expect, it } from '@jest/globals';

import { parseLocalizedMoneyMinor } from './parse-money';

describe('localized money input boundary', () => {
  it('parses Turkish and English strings to the same minor units', () => {
    expect(parseLocalizedMoneyMinor('1.234,56', 'tr')).toBe('123456');
    expect(parseLocalizedMoneyMinor('1,234.56', 'en')).toBe('123456');
  });

  it('rounds at the input boundary without exposing locale strings to the domain', () => {
    expect(parseLocalizedMoneyMinor('10,005', 'tr')).toBe('1001');
    expect(parseLocalizedMoneyMinor('10.004', 'en')).toBe('1000');
    expect(parseLocalizedMoneyMinor('not money', 'en')).toBeNull();
  });
});
