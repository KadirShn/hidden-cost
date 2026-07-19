import { Pressable, type PressableProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = Omit<PressableProps, 'children'> & { label: string; selected?: boolean };

export function Chip({ label, selected = false, disabled, ...props }: ChipProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: disabled ?? false }}
      disabled={disabled}
      style={({ pressed }) => ({
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: selected ? theme.colors.accent : theme.colors.surface,
        borderColor: selected ? theme.colors.accent : theme.colors.border,
        borderRadius: theme.radius.pill,
        borderWidth: 1,
        minHeight: 44,
        justifyContent: 'center',
        opacity: disabled ? 0.48 : pressed ? 0.72 : 1,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.xs,
      })}
      {...props}
    >
      <AppText
        selectable={false}
        variant="label"
        style={{ color: selected ? theme.colors.accentContrast : theme.colors.textPrimary }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
