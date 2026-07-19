import { ActivityIndicator, Pressable, StyleSheet, type PressableProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const palette = {
    primary: { background: theme.colors.accent, foreground: theme.colors.accentContrast },
    secondary: { background: theme.colors.surfaceMuted, foreground: theme.colors.textPrimary },
    danger: { background: theme.colors.danger, foreground: theme.colors.accentContrast },
    ghost: { background: 'transparent', foreground: theme.colors.accent },
  }[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          backgroundColor: palette.background,
          borderColor: variant === 'ghost' ? theme.colors.border : palette.background,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.sm,
        },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={palette.foreground} />
      ) : (
        <AppText selectable={false} variant="label" style={{ color: palette.foreground }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.48 },
});
