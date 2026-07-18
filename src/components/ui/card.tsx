import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export type CardProps = ViewProps & { elevated?: boolean };

export function Card({ style, elevated = false, ...props }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: elevated ? theme.colors.surfaceElevated : theme.colors.surface,
          borderColor: theme.colors.border,
          borderCurve: 'continuous',
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          boxShadow: elevated ? '0 8px 24px rgba(5, 27, 32, 0.08)' : undefined,
          gap: theme.spacing.md,
          padding: theme.spacing.lg,
        },
        style,
      ]}
      {...props}
    />
  );
}
