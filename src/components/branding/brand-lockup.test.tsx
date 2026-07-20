import { describe, expect, it } from '@jest/globals';

import { renderWithTheme } from '@/test/render-with-theme';

import { BrandLockup } from './brand-lockup';

describe('BrandLockup', () => {
  it('exposes the product name and tagline as one accessible brand identity', async () => {
    const screen = await renderWithTheme(
      <BrandLockup name="Hidden Cost" tagline="Make the true cost visible." />,
    );

    expect(screen.getByLabelText('Hidden Cost. Make the true cost visible.')).toBeTruthy();
    expect(screen.getByRole('header', { name: 'Hidden Cost' })).toBeTruthy();
  });
});
