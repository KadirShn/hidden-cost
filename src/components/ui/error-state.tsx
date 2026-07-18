import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

type ErrorStateProps = { title: string; message: string; retryLabel: string; onRetry: () => void };

export function ErrorState({ title, message, retryLabel, onRetry }: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityLiveRegion="assertive"
      style={{ alignItems: 'flex-start', gap: theme.spacing.md, paddingVertical: theme.spacing.xl }}
    >
      <AppText variant="subtitle" tone="danger">
        {title}
      </AppText>
      <AppText selectable tone="secondary">
        {message}
      </AppText>
      <Button label={retryLabel} onPress={onRetry} variant="secondary" />
    </View>
  );
}
