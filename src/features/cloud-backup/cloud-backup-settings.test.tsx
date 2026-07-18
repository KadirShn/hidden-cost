import { describe, expect, it, jest } from '@jest/globals';
import { I18nextProvider } from 'react-i18next';

import { SettingsProvider } from '@/features/settings/settings-provider';
import { i18n } from '@/i18n';
import { renderWithTheme } from '@/test/render-with-theme';

import { CloudBackupContext, type CloudBackupContextValue } from './cloud-backup-provider';
import { CloudBackupSettings } from './cloud-backup-settings';

jest.mock('@/services/firebase/firebase-client', () => ({
  firebaseClient: {
    configured: false,
    currentUser: () => null,
    subscribeAuth: () => () => undefined,
    signInAnonymously: jest.fn(),
    linkGoogleAccount: jest.fn(),
    applyMutation: jest.fn(),
    initializeRemoteConfig: jest.fn(async () => undefined),
    deleteAccountAndCloudData: jest.fn(),
  },
}));

describe('CloudBackupSettings', () => {
  it('keeps the local-only explanation visible when Firebase is not configured', async () => {
    await i18n.changeLanguage('en');
    const value: CloudBackupContextValue = {
      configured: false,
      googleLinkAvailable: false,
      enabled: false,
      user: null,
      status: 'unavailable',
      summary: { pending: 2, failed: 0, conflicts: 0 },
      setEnabled: jest.fn(async () => undefined),
      syncNow: jest.fn(async () => undefined),
      linkGoogle: jest.fn(async () => undefined),
      deleteCloudAccount: jest.fn(async () => undefined),
    };
    const screen = await renderWithTheme(
      <I18nextProvider i18n={i18n}>
        <SettingsProvider>
          <CloudBackupContext.Provider value={value}>
            <CloudBackupSettings />
          </CloudBackupContext.Provider>
        </SettingsProvider>
      </I18nextProvider>,
    );

    expect(screen.getByText(/credentials are not configured/i)).toBeTruthy();
    expect(screen.getByText(/Local calculations continue/i)).toBeTruthy();
  });
});
