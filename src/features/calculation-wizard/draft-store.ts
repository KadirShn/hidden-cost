import type { AppSettingsRepository } from '@/data/repositories/types';

import type { WizardFormValues } from './form-schema';

const keyFor = (projectId: string) => `wizard-draft:${projectId}`;

export function readWizardDraft(
  settings: AppSettingsRepository,
  projectId: string,
): WizardFormValues | null {
  return settings.get<WizardFormValues>(keyFor(projectId));
}

export function writeWizardDraft(
  settings: AppSettingsRepository,
  projectId: string,
  values: WizardFormValues,
): void {
  settings.set(keyFor(projectId), values);
}

export function clearWizardDraft(settings: AppSettingsRepository, projectId: string): void {
  settings.set(keyFor(projectId), null);
}
