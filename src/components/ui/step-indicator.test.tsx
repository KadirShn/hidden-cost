import { describe, expect, it } from '@jest/globals';

import { StepIndicator } from '@/components/ui/step-indicator';
import { renderWithTheme } from '@/test/render-with-theme';

describe('StepIndicator', () => {
  it('provides a textual progress alternative', async () => {
    const screen = await renderWithTheme(
      <StepIndicator currentStep={2} label="Step 2 of 3" totalSteps={3} />,
    );

    expect(screen.getByRole('progressbar', { name: 'Step 2 of 3' })).toBeTruthy();
    expect(screen.getByText('Step 2 of 3')).toBeTruthy();
  });
});
