import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { Button } from '@/components/ui/button';
import { renderWithTheme } from '@/test/render-with-theme';

describe('Button', () => {
  it('exposes its label and triggers its action', async () => {
    const onPress = jest.fn();
    const screen = await renderWithTheme(<Button label="Continue" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not trigger its action while disabled', async () => {
    const onPress = jest.fn();
    const screen = await renderWithTheme(<Button disabled label="Continue" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
