import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type FatalErrorScreenProps = {
  onRetry: () => void | Promise<void>;
};

export function FatalErrorScreen({ onRetry }: FatalErrorScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        Hidden Cost could not start
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        Your data was not changed. Please try again.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => void onRetry()}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.text },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={[styles.buttonLabel, { color: colors.background }]}>Try again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: Spacing.three,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 360,
    textAlign: 'center',
  },
  button: {
    borderRadius: Spacing.two,
    minHeight: 48,
    minWidth: 140,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
