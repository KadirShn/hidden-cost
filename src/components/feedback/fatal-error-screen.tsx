import { Pressable, ScrollView, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { themes } from '@/theme/tokens';

type FatalErrorScreenProps = {
  title: string;
  message: string;
  actionLabel: string;
  onRetry: () => void | Promise<void>;
};

export function FatalErrorScreen({ title, message, actionLabel, onRetry }: FatalErrorScreenProps) {
  const scheme = useColorScheme();
  const theme = themes[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={styles.content}>
        <Text
          accessibilityRole="header"
          selectable
          style={[theme.typography.title, { color: theme.colors.textPrimary, textAlign: 'center' }]}
        >
          {title}
        </Text>
        <Text
          selectable
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, textAlign: 'center' },
          ]}
        >
          {message}
        </Text>
        <Pressable
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onPress={() => void onRetry()}
          style={({ pressed }) => ({
            alignItems: 'center',
            backgroundColor: theme.colors.accent,
            borderRadius: theme.radius.md,
            justifyContent: 'center',
            minHeight: 48,
            minWidth: 140,
            opacity: pressed ? 0.72 : 1,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.sm,
          })}
        >
          <Text style={[theme.typography.label, { color: theme.colors.accentContrast }]}>
            {actionLabel}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
});
