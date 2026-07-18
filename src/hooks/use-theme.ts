import { use } from 'react';

import { AppThemeContext } from '@/theme/theme-provider';

export function useTheme() {
  const theme = use(AppThemeContext);

  if (!theme) throw new Error('useTheme must be used within AppThemeProvider.');

  return theme;
}
