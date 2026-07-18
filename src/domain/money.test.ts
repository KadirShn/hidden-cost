import { describe, expect, it } from '@jest/globals';

import { Money, MoneyCurrencyMismatchError } from './money';

describe('Money', () => {
  it('preserves integers beyond JavaScript safe integer range', () => {
    const total = Money.fromMinor('900719925474099300', 'TRY').add(Money.fromMinor('700', 'TRY'));
    expect(total.toMinorString()).toBe('900719925474100000');
  });

  it('rounds decimal minor values half up only when serialized', () => {
    expect(Money.fromMinor('1', 'USD').divide(2).toMinorString()).toBe('1');
    expect(Money.fromMinor('1', 'USD').divide(3).multiply(3).toMinorString()).toBe('1');
  });

  it('rejects mismatched currencies', () => {
    expect(() => Money.fromMinor('1', 'TRY').add(Money.fromMinor('1', 'USD'))).toThrow(
      MoneyCurrencyMismatchError,
    );
  });

  it('rejects fractional persisted minor units and invalid currencies', () => {
    expect(() => Money.fromMinor('1.2', 'TRY')).toThrow('integer');
    expect(() => Money.fromMinor(Number.MAX_SAFE_INTEGER + 1, 'TRY')).toThrow('safe integer');
    expect(() => Money.fromMinor('1', 'try')).toThrow('ISO 4217');
  });
});
