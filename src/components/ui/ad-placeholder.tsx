import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

export function AdPlaceholder({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        borderStyle: 'dashed',
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 64,
        padding: theme.spacing.md,
      }}
    >
      <AppText variant="helper" tone="secondary">
        {label}
      </AppText>
    </View>
  );
}
