import { render, type RenderOptions } from '@testing-library/react-native';

import { AppThemeContext } from '@/theme/theme-provider';
import { themes } from '@/theme/tokens';

import type { ReactElement } from 'react';

export function renderWithTheme(element: ReactElement, options?: RenderOptions) {
  return render(
    <AppThemeContext.Provider value={themes.light}>{element}</AppThemeContext.Provider>,
    options,
  );
}
