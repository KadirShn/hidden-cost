import { describe, expect, it } from '@jest/globals';

import { buildProjectReportHtml, buildResultCardHtml } from './report-html';

describe('report HTML', () => {
  it('escapes user content and includes legal and engine version metadata', () => {
    const html = buildProjectReportHtml({
      documentTitle: 'Hidden Cost',
      projectTitle: '<script>alert(1)</script>',
      generatedAtLabel: 'Today',
      categoryLabel: 'Category',
      category: 'Motorcycle',
      currencyLabel: 'Currency',
      currency: 'TRY',
      ownershipLabel: 'Ownership',
      ownership: '36 months',
      totalLabel: 'Total',
      total: 'TRY 100',
      monthlyLabel: 'Monthly',
      monthly: 'TRY 10',
      usageLabel: 'Usage',
      usage: 'TRY 1/km',
      breakdownTitle: 'Breakdown',
      breakdown: [{ label: 'Fuel', value: 'TRY 20', percent: '20%' }],
      assumptionsTitle: 'Assumptions',
      assumptions: [],
      financingTitle: 'Financing',
      scenariosTitle: 'Scenarios',
      scenarios: [],
      legalTitle: 'Notice',
      legalDisclaimer: 'Not financial advice.',
      appVersionLabel: 'App',
      appVersion: '1.0.0',
      engineVersionLabel: 'Engine',
      engineVersion: '1.0.0',
    });

    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('Not financial advice.');
    expect(html).toContain('Engine 1.0.0');
  });

  it('creates a compact result card document', () => {
    const html = buildResultCardHtml({
      brand: 'Hidden Cost',
      projectTitle: 'Motorcycle',
      totalLabel: 'Total',
      total: 'TRY 100',
      monthlyLabel: 'Monthly',
      monthly: 'TRY 10',
      usageLabel: 'Usage',
      usage: 'TRY 1',
      completenessLabel: 'Completeness',
      completeness: '100%',
      disclaimer: 'Estimate',
    });
    expect(html).toContain('@page { size: 420px 560px');
    expect(html).toContain('Motorcycle');
  });
});
