import { describe, expect, it } from '@jest/globals';

import { initializeApplication } from '@/features/app-initialization/initialize-application';

describe('initializeApplication', () => {
  it('makes the validated runtime environment available to the application', async () => {
    await expect(initializeApplication({ appEnvironment: 'preview' })).resolves.toEqual({
      appEnvironment: 'preview',
    });
  });
});
