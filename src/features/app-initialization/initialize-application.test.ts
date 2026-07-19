import { describe, expect, it, jest } from '@jest/globals';

import {
  DatabaseInitializationError,
  initializeApplication,
} from '@/features/app-initialization/initialize-application';

describe('initializeApplication', () => {
  it('makes the validated runtime environment available to the application', async () => {
    const databaseInitializer = jest.fn(() => ({}) as never);
    await expect(
      initializeApplication({ appEnvironment: 'preview' }, databaseInitializer),
    ).resolves.toEqual({
      appEnvironment: 'preview',
      databaseReady: true,
      startupDurationMs: expect.any(Number),
    });
    expect(databaseInitializer).toHaveBeenCalledTimes(1);
  });

  it('wraps migration failures without exposing the underlying database error', async () => {
    const databaseInitializer = jest.fn(() => {
      throw new Error('sensitive sqlite details');
    });
    await expect(
      initializeApplication({ appEnvironment: 'production' }, databaseInitializer),
    ).rejects.toBeInstanceOf(DatabaseInitializationError);
  });
});
