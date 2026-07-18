import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useTheme } from '@/hooks/use-theme';

export function OfflineBanner({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={{
        backgroundColor: theme.colors.surfaceMuted,
        borderColor: theme.colors.warning,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        padding: theme.spacing.md,
      }}
    >
      <AppText selectable variant="helper" tone="warning">
        {message}
      </AppText>
    </View>
  );
}
