import { ScrollView, StyleSheet, View, useWindowDimensions, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { maxContentWidth } from '@/theme/tokens';

import type { PropsWithChildren } from 'react';

type ScreenProps = PropsWithChildren<{
  contentStyle?: ViewStyle;
  testID?: string;
}>;

export function Screen({ children, contentStyle, testID }: ScreenProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 380 ? theme.spacing.lg : theme.spacing.xl;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.outerContent}
      testID={testID}
    >
      <View
        style={[
          styles.content,
          { gap: theme.spacing.xl, padding: horizontalPadding },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  outerContent: { alignItems: 'center', flexGrow: 1 },
  content: { flexGrow: 1, maxWidth: maxContentWidth, width: '100%' },
});
