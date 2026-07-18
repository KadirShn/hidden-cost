import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: SymbolViewProps['name'];
  label: string;
  variant?: 'default' | 'accent';
};

export function IconButton({
  icon,
  label,
  variant = 'default',
  disabled,
  ...props
}: IconButtonProps) {
  const theme = useTheme();
  const backgroundColor = variant === 'accent' ? theme.colors.accent : theme.colors.surfaceElevated;
  const foregroundColor =
    variant === 'accent' ? theme.colors.accentContrast : theme.colors.textPrimary;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled ?? false }}
      disabled={disabled}
      hitSlop={4}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor: theme.colors.border, borderRadius: theme.radius.md },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
      {...props}
    >
      <SymbolView name={icon} size={20} tintColor={foregroundColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.48 },
});
