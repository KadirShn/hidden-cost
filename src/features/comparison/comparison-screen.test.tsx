import { describe, expect, it } from '@jest/globals';
import { I18nextProvider } from 'react-i18next';

import { calculateCostProject } from '@/domain';
import { projectFixture } from '@/domain/calculation/__fixtures__/builders';
import { SettingsProvider } from '@/features/settings/settings-provider';
import { i18n } from '@/i18n';
import { renderWithTheme } from '@/test/render-with-theme';

import { ComparisonResults } from './comparison-screen';

describe('ComparisonResults', () => {
  it('blocks invalid cross-currency charts and ranking', async () => {
    await i18n.changeLanguage('en');
    const first = projectFixture({
      id: 'one',
      title: 'One',
      currency: 'TRY',
      usagePerMonth: 10,
      usageUnit: 'use',
    });
    const second = projectFixture({
      id: 'two',
      title: 'Two',
      currency: 'USD',
      usagePerMonth: 10,
      usageUnit: 'use',
    });
    const entries = [first, second].map((project) => ({
      project,
      result: calculateCostProject({ project, costItems: [] }),
    }));
    const screen = await renderWithTheme(
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <ComparisonResults entries={entries} />
        </SettingsProvider>
      </I18nextProvider>,
    );

    expect(screen.getByText(/Currencies differ/)).toBeTruthy();
    expect(screen.queryByRole('image', { name: /One total/ })).toBeNull();
    expect(screen.queryByText(/lowest for this metric/)).toBeNull();
  });

  it('renders accessible total bars for a shared currency', async () => {
    await i18n.changeLanguage('en');
    const entries = ['one', 'two'].map((id) => {
      const project = projectFixture({ id, title: id, currency: 'TRY' });
      return { project, result: calculateCostProject({ project, costItems: [] }) };
    });
    const screen = await renderWithTheme(
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <ComparisonResults entries={entries} />
        </SettingsProvider>
      </I18nextProvider>,
    );

    expect(screen.getByRole('image', { name: /one total/ })).toBeTruthy();
  });
});
