import { zodResolver } from '@hookform/resolvers/zod';
import { describe, expect, it } from '@jest/globals';
import { act, fireEvent } from '@testing-library/react-native';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { I18nextProvider } from 'react-i18next';

import type { ProjectBundle } from '@/data/repositories/types';
import { seedTemplates } from '@/data/templates/seed-templates';
import { SettingsProvider } from '@/features/settings/settings-provider';
import { i18n } from '@/i18n';
import { renderWithTheme } from '@/test/render-with-theme';

import { CostRowsEditor } from './cost-rows-editor';
import { getEnergyProfile } from './energy-profile';
import { createProjectDraft, projectBundleToForm } from './form-mapper';
import { createWizardFormSchema, type WizardFormValues } from './form-schema';

type FormHandle = { values: () => WizardFormValues; validate: () => Promise<boolean> };
const handle: { current: FormHandle | null } = { current: null };

function Harness({ defaults }: { defaults: WizardFormValues }) {
  const form = useForm<WizardFormValues>({
    defaultValues: defaults,
    resolver: zodResolver(createWizardFormSchema('en')),
  });
  useEffect(() => {
    handle.current = {
      values: () => form.getValues(),
      validate: () => form.trigger('recurringCosts'),
    };
  }, [form]);
  return (
    <CostRowsEditor
      addLabel="Add cost line"
      body="Body"
      control={form.control}
      currency="TRY"
      name="recurringCosts"
      title="Regular costs"
    />
  );
}

function carDefaults(): WizardFormValues {
  const template = seedTemplates.find((item) => item.id === 'car')!;
  const project = createProjectDraft(template, 'Car', '2026-01-01T00:00:00.000Z');
  const bundle: ProjectBundle = { project, costItems: [], scenarioOverrides: [] };
  return projectBundleToForm(bundle, template, getEnergyProfile(project), 'en');
}

describe('CostRowsEditor', () => {
  it('shows template lines with frequencies and lets custom lines be added and removed', async () => {
    await i18n.changeLanguage('en');
    const screen = await renderWithTheme(
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <Harness defaults={carDefaults()} />
        </SettingsProvider>
      </I18nextProvider>,
    );

    expect(screen.getByText('Comprehensive insurance')).toBeTruthy();
    expect(screen.getAllByText('Yearly').length).toBeGreaterThan(0);
    expect(screen.queryByText('Remove line')).toBeNull();

    const templateRowCount = handle.current!.values().recurringCosts.length;
    await act(async () => {
      fireEvent.press(screen.getByTestId('wizard-recurringCosts-add'));
    });
    expect(handle.current!.values().recurringCosts).toHaveLength(templateRowCount + 1);
    expect(screen.getByText('Line name')).toBeTruthy();

    // An unnamed custom line blocks the step until it is named or removed.
    let valid = true;
    await act(async () => {
      valid = await handle.current!.validate();
    });
    expect(valid).toBe(false);

    await act(async () => {
      fireEvent.press(screen.getByText('Remove line'));
    });
    expect(handle.current!.values().recurringCosts).toHaveLength(templateRowCount);
    await act(async () => {
      valid = await handle.current!.validate();
    });
    expect(valid).toBe(true);
  });
});
