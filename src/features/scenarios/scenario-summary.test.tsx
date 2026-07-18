import { describe, expect, it } from '@jest/globals';
import { I18nextProvider } from 'react-i18next';

import { analyzeScenarios } from '@/domain';
import { projectFixture } from '@/domain/calculation/__fixtures__/builders';
import { SettingsProvider } from '@/features/settings/settings-provider';
import { i18n } from '@/i18n';
import { renderWithTheme } from '@/test/render-with-theme';

import { ScenarioSummaryView } from './scenario-summary';

describe('ScenarioSummaryView', () => {
  it('shows low, base, high and the strongest assumption', async () => {
    await i18n.changeLanguage('en');
    const project = projectFixture({ usagePerMonth: 100, usageUnit: 'use' });
    const analysis = analyzeScenarios({ project, costItems: [] }, [
      { scenario: 'high', path: 'project.usagePerMonth', value: 200 },
    ]);
    const screen = await renderWithTheme(
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <ScenarioSummaryView analysis={analysis} currency="TRY" onEdit={() => undefined} />
        </SettingsProvider>
      </I18nextProvider>,
    );

    expect(screen.getByText('Scenario range')).toBeTruthy();
    expect(screen.getByText(/Strongest assumption/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Edit scenarios' })).toBeTruthy();
  });
});
