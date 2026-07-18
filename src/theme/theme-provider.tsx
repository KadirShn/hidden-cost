import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router/react-navigation';
import { createContext, useMemo, type PropsWithChildren } from 'react';

import { useSettings } from '@/features/settings/use-settings';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { themes, type ThemeTokens } from '@/theme/tokens';

export const AppThemeContext = createContext<ThemeTokens | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const { themePreference } = useSettings();
  const mode =
    themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;
  const theme = themes[mode];
  const navigationTheme = useMemo(
    () => ({
      ...(mode === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        primary: theme.colors.accent,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.danger,
      },
    }),
    [mode, theme],
  );

  return (
    <AppThemeContext.Provider value={theme}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </AppThemeContext.Provider>
  );
}
