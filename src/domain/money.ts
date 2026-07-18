import { Decimal } from 'decimal.js';

export const ISO_CURRENCY_PATTERN = /^[A-Z]{3}$/;

export class MoneyCurrencyMismatchError extends Error {
  constructor(left: string, right: string) {
    super(`Cannot operate on different currencies: ${left} and ${right}`);
    this.name = 'MoneyCurrencyMismatchError';
  }
}

export class Money {
  readonly currency: string;
  readonly #minor: Decimal;

  private constructor(minor: Decimal.Value, currency: string) {
    if (!ISO_CURRENCY_PATTERN.test(currency)) {
      throw new TypeError(`Invalid ISO 4217 currency code: ${currency}`);
    }

    const decimal = new Decimal(minor);
    if (!decimal.isFinite()) {
      throw new TypeError('Money must be finite');
    }

    this.currency = currency;
    this.#minor = decimal;
  }

  static fromMinor(minor: string | bigint | number, currency: string): Money {
    if (typeof minor === 'number' && !Number.isSafeInteger(minor)) {
      throw new TypeError(
        'Numeric minor units must be a safe integer; use a string for large values',
      );
    }
    const decimal = new Decimal(minor.toString());
    if (!decimal.isInteger()) {
      throw new TypeError('Persisted minor units must be an integer');
    }
    return new Money(decimal, currency);
  }

  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  static fromDecimalMinor(minor: Decimal.Value, currency: string): Money {
    return new Money(minor, currency);
  }

  add(other: Money): Money {
    this.assertCurrency(other);
    return new Money(this.#minor.plus(other.#minor), this.currency);
  }

  subtract(other: Money): Money {
    this.assertCurrency(other);
    return new Money(this.#minor.minus(other.#minor), this.currency);
  }

  multiply(multiplier: Decimal.Value): Money {
    return new Money(this.#minor.times(multiplier), this.currency);
  }

  divide(divisor: Decimal.Value): Money {
    const value = new Decimal(divisor);
    if (value.isZero()) throw new RangeError('Cannot divide money by zero');
    return new Money(this.#minor.dividedBy(value), this.currency);
  }

  max(other: Money): Money {
    this.assertCurrency(other);
    return this.#minor.greaterThanOrEqualTo(other.#minor) ? this : other;
  }

  isNegative(): boolean {
    return this.#minor.isNegative();
  }

  isZero(): boolean {
    return this.#minor.isZero();
  }

  toDecimalMinor(): Decimal {
    return new Decimal(this.#minor);
  }

  toMinorString(): string {
    return this.#minor.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toFixed(0);
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.#minor.equals(other.#minor);
  }

  private assertCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new MoneyCurrencyMismatchError(this.currency, other.currency);
    }
  }
}
