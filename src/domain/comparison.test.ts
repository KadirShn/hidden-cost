import { describe, expect, it } from '@jest/globals';

import { projectFixture } from './calculation/__fixtures__/builders';
import { calculateCostProject } from './calculation/engine';
import { compareProjects } from './comparison';

function entry(id: string, currency: string, months: number, purchaseMinor: string) {
  const project = projectFixture({
    id,
    currency,
    ownershipMonths: months,
    purchasePriceMinor: purchaseMinor,
    usagePerMonth: 10,
    usageUnit: 'use',
  });
  return { project, result: calculateCostProject({ project, costItems: [] }) };
}

describe('project comparison rules', () => {
  it('ranks total and monthly metrics separately and supports common-period normalization', () => {
    const result = compareProjects(
      [entry('short', 'TRY', 12, '12000'), entry('long', 'TRY', 24, '18000')],
      { normalizeToMonths: 36 },
    );

    expect(result.warnings).toContain('different_ownership_periods');
    expect(result.lowestTotalProjectIds).toEqual(['short']);
    expect(result.lowestMonthlyProjectIds).toEqual(['long']);
    expect(result.normalizedTotals).toEqual([
      { projectId: 'short', months: 36, valueMinor: '36000' },
      { projectId: 'long', months: 36, valueMinor: '27000' },
    ]);
  });

  it('does not convert or rank projects with different currencies', () => {
    const result = compareProjects([
      entry('try', 'TRY', 12, '10000'),
      entry('usd', 'USD', 12, '100'),
    ]);
    expect(result.warnings).toContain('different_currencies');
    expect(result.lowestTotalProjectIds).toEqual([]);
    expect(result.lowestMonthlyProjectIds).toEqual([]);
  });

  it('rejects more than three projects and incompatible usage metrics', () => {
    const entries = [
      entry('one', 'TRY', 12, '100'),
      entry('two', 'TRY', 12, '200'),
      entry('three', 'TRY', 12, '300'),
      entry('four', 'TRY', 12, '400'),
    ];
    expect(() => compareProjects(entries)).toThrow('two or three');
    const incompatible = entries.slice(0, 2);
    incompatible[1] = {
      ...incompatible[1],
      project: { ...incompatible[1].project, usageUnit: 'km' },
    };
    expect(compareProjects(incompatible).warnings).toContain('incompatible_usage_units');
  });
});
