import { Platform, type TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'system-ui',
  android: 'sans-serif',
  default: 'system-ui, sans-serif',
});

const monoFontFamily = Platform.select({
  ios: 'ui-monospace',
  android: 'monospace',
  default: 'ui-monospace, monospace',
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontFamily,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
  },
  title: {
    fontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  subtitle: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  helper: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  label: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  metric: {
    fontFamily: monoFontFamily,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
} satisfies Record<string, TextStyle>;

const lightColors = {
  background: '#F5F7F8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceMuted: '#E9EEF1',
  textPrimary: '#142025',
  textSecondary: '#5E6C72',
  border: '#D5DEE2',
  accent: '#087E72',
  accentContrast: '#FFFFFF',
  success: '#18794E',
  warning: '#A15C00',
  danger: '#C73232',
  overlay: 'rgba(9, 20, 24, 0.52)',
  skeleton: '#DDE5E8',
  chartPurchase: '#087E72',
  chartRecurring: '#3F7CAC',
  chartUsage: '#DB8B2C',
  chartFinancing: '#7A5DB0',
  chartResidual: '#2E8B57',
} as const;

const darkColors: ThemeColors = {
  background: '#0D1417',
  surface: '#152126',
  surfaceElevated: '#1C2A30',
  surfaceMuted: '#24343A',
  textPrimary: '#F3F7F8',
  textSecondary: '#AAB9BF',
  border: '#33464D',
  accent: '#58D1C2',
  accentContrast: '#08221E',
  success: '#65D49B',
  warning: '#F4B75E',
  danger: '#FF8B8B',
  overlay: 'rgba(0, 0, 0, 0.68)',
  skeleton: '#293A40',
  chartPurchase: '#58D1C2',
  chartRecurring: '#78B6EA',
  chartUsage: '#F4B75E',
  chartFinancing: '#B9A0EA',
  chartResidual: '#7BD7A5',
};

export type ThemeColors = { [Key in keyof typeof lightColors]: string };
export type ThemeMode = 'light' | 'dark';
export type ThemePreference = 'system' | ThemeMode;

export type ThemeTokens = Readonly<{
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}>;

export const themes: Record<ThemeMode, ThemeTokens> = {
  light: { mode: 'light', colors: lightColors, spacing, radius, typography },
  dark: { mode: 'dark', colors: darkColors, spacing, radius, typography },
};

export const maxContentWidth = 720;
