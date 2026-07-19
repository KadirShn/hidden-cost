import { describe, expect, it, jest } from '@jest/globals';
import { waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { TextField } from '@/components/ui/text-field';
import { renderWithTheme } from '@/test/render-with-theme';

describe('TextField', () => {
  it('connects an accessible label and announces validation errors', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => undefined);
    const screen = await renderWithTheme(
      <TextField errorText="Amount is required" label="Amount" value="" />,
    );

    expect(screen.getByLabelText('Amount')).toBeTruthy();
    expect(screen.getByText('Amount is required')).toHaveProp(
      'accessibilityLiveRegion',
      'assertive',
    );
    await waitFor(() => expect(announce).toHaveBeenCalledWith('Amount. Amount is required'));
  });
});
