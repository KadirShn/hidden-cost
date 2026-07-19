import { describe, expect, it } from '@jest/globals';

import { VirtualizedScreen } from '@/components/layout/virtualized-screen';
import { AppText } from '@/components/ui/app-text';
import { renderWithTheme } from '@/test/render-with-theme';

describe('VirtualizedScreen', () => {
  it('uses bounded FlatList rendering for long project and template lists', async () => {
    const screen = await renderWithTheme(
      <VirtualizedScreen
        data={Array.from({ length: 100 }, (_, index) => ({ id: String(index) }))}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppText>{item.id}</AppText>}
        testID="long-list"
      />,
    );

    const list = screen.getByTestId('long-list');
    expect(list).toHaveProp('initialNumToRender', 8);
    expect(list).toHaveProp('maxToRenderPerBatch', 8);
    expect(list).toHaveProp('windowSize', 7);
    expect(list).toHaveProp('contentInsetAdjustmentBehavior', 'automatic');
  });
});
