import { describe, expect, it } from '@jest/globals';

import { costItemFixture, projectFixture } from './calculation/__fixtures__/builders';
import {
  CostItemSchema,
  CostProjectSchema,
  FinancingPlanSchema,
  ResidualValueSchema,
} from './schemas';

describe('domain schemas', () => {
  it('accepts a valid project and rejects invalid currency/minor units', () => {
    expect(CostProjectSchema.parse(projectFixture()).currency).toBe('TRY');
    expect(() => CostProjectSchema.parse(projectFixture({ currency: 'try' }))).toThrow();
    expect(() => CostProjectSchema.parse(projectFixture({ purchasePriceMinor: '1.2' }))).toThrow();
  });

  it('enforces type-specific cost item requirements', () => {
    expect(() =>
      CostItemSchema.parse(
        costItemFixture({ type: 'recurring', amountMinor: '100', frequency: undefined }),
      ),
    ).toThrow();
    expect(() =>
      CostItemSchema.parse(
        costItemFixture({ type: 'usage', amountMinor: undefined, costPerUnitMinor: undefined }),
      ),
    ).toThrow();
  });

  it('validates enabled financing and residual modes', () => {
    expect(() =>
      FinancingPlanSchema.parse({
        enabled: true,
        downPaymentMinor: '0',
        financedAmountMinor: '0',
        annualInterestRate: 0,
        termMonths: 0,
        loanFeesMinor: '0',
      }),
    ).toThrow();
    expect(() => ResidualValueSchema.parse({ mode: 'fixed', sellingCostsMinor: '0' })).toThrow();
  });
});
