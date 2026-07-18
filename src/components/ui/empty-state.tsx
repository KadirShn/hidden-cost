import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="summary"
      style={{ alignItems: 'flex-start', gap: theme.spacing.md, paddingVertical: theme.spacing.xl }}
    >
      <AppText variant="subtitle">{title}</AppText>
      <AppText selectable tone="secondary">
        {message}
      </AppText>
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}
