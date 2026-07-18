import { describe, expect, it } from '@jest/globals';

import { settingsStore } from '@/store/settings-store';

describe('settingsStore', () => {
  it('persists small application preferences', () => {
    settingsStore.set('test.theme', 'dark');

    expect(settingsStore.get('test.theme')).toBe('dark');
  });
});
