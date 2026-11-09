import type { AppSettingsRepository } from '@/data/repositories/types';

import { isWizardFormValues, type WizardFormValues } from './form-schema';

const keyFor = (projectId: string) => `wizard-draft:v2:${projectId}`;
const legacyKeyFor = (projectId: string) => `wizard-draft:${projectId}`;

export function readWizardDraft(
  settings: AppSettingsRepository,
  projectId: string,
): WizardFormValues | null {
  const draft = settings.get<unknown>(keyFor(projectId));
  return isWizardFormValues(draft) ? draft : null;
}

export function writeWizardDraft(
  settings: AppSettingsRepository,
  projectId: string,
  values: WizardFormValues,
): void {
  settings.set(keyFor(projectId), values);
}

export function clearWizardDraft(settings: AppSettingsRepository, projectId: string): void {
  settings.remove(keyFor(projectId));
  settings.remove(legacyKeyFor(projectId));
}
