import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { typography } from '@/theme/tokens';

export type TextVariant = keyof typeof typography;

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'warning';
};

export function AppText({ style, variant = 'body', tone = 'primary', ...props }: AppTextProps) {
  const theme = useTheme();
  const toneColors = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    accent: theme.colors.accent,
    danger: theme.colors.danger,
    success: theme.colors.success,
    warning: theme.colors.warning,
  };

  return <Text style={[typography[variant], { color: toneColors[tone] }, style]} {...props} />;
}
