import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function InitializationScreen({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ActivityIndicator color={theme.colors.accent} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center' },
});
