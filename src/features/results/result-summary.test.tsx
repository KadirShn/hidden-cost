import { describe, expect, it } from '@jest/globals';
import { I18nextProvider } from 'react-i18next';

import { calculateCostProject } from '@/domain';
import { costItemFixture, projectFixture } from '@/domain/calculation/__fixtures__/builders';
import { SettingsProvider } from '@/features/settings/settings-provider';
import { i18n } from '@/i18n';
import { renderWithTheme } from '@/test/render-with-theme';

import { ResultSummary } from './result-summary';

describe('ResultSummary', () => {
  it('renders accessible metrics, breakdown and completeness', async () => {
    await i18n.changeLanguage('en');
    const project = projectFixture({
      purchasePriceMinor: '1000000',
      ownershipMonths: 12,
      usagePerMonth: 100,
      residualValue: { mode: 'fixed', fixedAmountMinor: '200000', sellingCostsMinor: '0' },
    });
    const result = calculateCostProject({
      project,
      costItems: [
        costItemFixture({
          type: 'recurring',
          key: 'maintenance',
          amountMinor: '120000',
          frequency: 'annual',
        }),
      ],
    });
    const screen = await renderWithTheme(
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <ResultSummary result={result} />
        </SettingsProvider>
      </I18nextProvider>,
    );

    expect(screen.getByText('Total cost of ownership')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: /Data completeness/ })).toBeTruthy();
    expect(screen.getByText('Cost breakdown')).toBeTruthy();
    expect(screen.getByText('Top cost drivers')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Show assumptions and formulas' })).toBeTruthy();
  });
});
