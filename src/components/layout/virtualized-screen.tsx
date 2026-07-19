import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { maxContentWidth } from '@/theme/tokens';

import type { ReactNode } from 'react';
import type { FlatListProps, ListRenderItem } from 'react-native';

type VirtualizedScreenProps<Item> = Pick<
  FlatListProps<Item>,
  'data' | 'keyExtractor' | 'onEndReached' | 'refreshControl' | 'testID'
> & {
  renderItem: ListRenderItem<Item>;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
};

export function VirtualizedScreen<Item>({
  renderItem,
  header,
  footer,
  empty,
  ...props
}: VirtualizedScreenProps<Item>) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const horizontalPadding = width < 380 ? theme.spacing.lg : theme.spacing.xl;
  const contentStyle = {
    gap: theme.spacing.lg,
    maxWidth: maxContentWidth,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: horizontalPadding,
    width: '100%' as const,
  };

  return (
    <FlatList
      {...props}
      contentContainerStyle={styles.contentContainer}
      contentInsetAdjustmentBehavior="automatic"
      initialNumToRender={8}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={empty ? <View style={contentStyle}>{empty}</View> : null}
      ListFooterComponent={footer ? <View style={contentStyle}>{footer}</View> : null}
      ListHeaderComponent={header ? <View style={contentStyle}>{header}</View> : null}
      maxToRenderPerBatch={8}
      removeClippedSubviews={process.env.EXPO_OS === 'android'}
      renderItem={(info) => <View style={contentStyle}>{renderItem(info)}</View>}
      style={{ backgroundColor: theme.colors.background }}
      updateCellsBatchingPeriod={50}
      windowSize={7}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: { alignItems: 'center', flexGrow: 1, paddingBottom: 32 },
});
