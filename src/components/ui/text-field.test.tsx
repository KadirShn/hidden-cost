import { describe, expect, it } from '@jest/globals';

import { TextField } from '@/components/ui/text-field';
import { renderWithTheme } from '@/test/render-with-theme';

describe('TextField', () => {
  it('connects an accessible label and announces validation errors', async () => {
    const screen = await renderWithTheme(
      <TextField errorText="Amount is required" label="Amount" value="" />,
    );

    expect(screen.getByLabelText('Amount')).toBeTruthy();
    expect(screen.getByText('Amount is required')).toHaveProp('accessibilityLiveRegion', 'polite');
  });
});
