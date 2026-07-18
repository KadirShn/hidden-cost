import { use } from 'react';

import { SettingsContext } from '@/features/settings/settings-provider';

export function useSettings() {
  const settings = use(SettingsContext);

  if (!settings) throw new Error('useSettings must be used within SettingsProvider.');

  return settings;
}
