import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';

import { runtimeConfig } from '@/config/runtime-config';
import { defaultRepositoryDependencies } from '@/data/repositories/dependencies';
import { useRepositories } from '@/data/repositories/repository-provider';
import type { SyncQueueSummary } from '@/data/repositories/types';
import { useSettings } from '@/features/settings/use-settings';
import { useNetworkStatus } from '@/hooks/use-network-status';
import type { CloudUser } from '@/services/firebase/contracts';
import { firebaseClient } from '@/services/firebase/firebase-client';
import { FirebaseSyncWorker } from '@/services/firebase/sync-worker';
import type { AppErrorCode } from '@/services/observability/errors';
import { telemetry } from '@/services/observability/telemetry-service';

const BACKUP_ENABLED_KEY = 'cloudBackup.enabled';
const LAST_SYNC_KEY = 'cloudBackup.lastSyncAt';

export type CloudBackupStatus =
  'unavailable' | 'local_only' | 'connecting' | 'idle' | 'syncing' | 'error' | 'conflict';

export type CloudBackupContextValue = {
  configured: boolean;
  googleLinkAvailable: boolean;
  enabled: boolean;
  user: CloudUser | null;
  status: CloudBackupStatus;
  summary: SyncQueueSummary;
  lastSyncAt?: string;
  errorCode?: AppErrorCode;
  setEnabled: (enabled: boolean) => Promise<void>;
  syncNow: () => Promise<void>;
  linkGoogle: () => Promise<void>;
  deleteCloudAccount: () => Promise<void>;
};

export const CloudBackupContext = createContext<CloudBackupContextValue | null>(null);

export function CloudBackupProvider({ children }: PropsWithChildren) {
  const repositories = useRepositories();
  const { analyticsConsent, locale, themePreference } = useSettings();
  const { isOffline } = useNetworkStatus();
  const [enabled, setEnabledState] = useState(
    () => repositories.settings.get<boolean>(BACKUP_ENABLED_KEY) ?? false,
  );
  const [user, setUser] = useState<CloudUser | null>(() =>
    firebaseClient.configured ? firebaseClient.currentUser() : null,
  );
  const [status, setStatus] = useState<CloudBackupStatus>(() =>
    firebaseClient.configured ? (enabled ? 'connecting' : 'local_only') : 'unavailable',
  );
  const [summary, setSummary] = useState(() => repositories.syncQueue.getSummary());
  const [lastSyncAt, setLastSyncAt] = useState<string | undefined>(
    () => repositories.settings.get<string>(LAST_SYNC_KEY) ?? undefined,
  );
  const [errorCode, setErrorCode] = useState<AppErrorCode>();
  const worker = useMemo(
    () => new FirebaseSyncWorker(repositories.syncQueue, firebaseClient),
    [repositories.syncQueue],
  );
  const refreshSummary = useCallback(
    () => setSummary(repositories.syncQueue.getSummary()),
    [repositories.syncQueue],
  );
  const syncNow = useCallback(async () => {
    const activeUser = firebaseClient.configured ? firebaseClient.currentUser() : null;
    if (!enabled || !activeUser || isOffline) {
      refreshSummary();
      return;
    }
    setStatus('syncing');
    setErrorCode(undefined);
    try {
      const result = await worker.run(activeUser.uid);
      refreshSummary();
      if (result.conflicts > 0) {
        setStatus('conflict');
      } else if (result.failed > 0) {
        setStatus('error');
      } else {
        const syncedAt = new Date().toISOString();
        repositories.settings.set(LAST_SYNC_KEY, syncedAt);
        setLastSyncAt(syncedAt);
        setStatus('idle');
      }
    } catch {
      void telemetry.track('sync_failed', { is_offline: isOffline, source_screen: 'sync_worker' });
      refreshSummary();
      setErrorCode('sync/failed');
      setStatus('error');
    }
  }, [enabled, isOffline, refreshSummary, repositories.settings, worker]);
  const upsertProfile = useCallback(
    (nextUser: CloudUser, cloudBackupEnabled: boolean) => {
      const now = new Date().toISOString();
      repositories.userProfiles.upsert({
        id: nextUser.uid,
        authType: nextUser.isAnonymous ? 'anonymous' : 'google',
        displayName: nextUser.displayName,
        email: nextUser.email,
        locale,
        defaultCurrency: 'TRY',
        theme: themePreference,
        cloudBackupEnabled,
        analyticsConsent,
        adsConsentStatus: 'unknown',
        createdAt: now,
        updatedAt: now,
        revision: 0,
        deviceId: defaultRepositoryDependencies.deviceId,
      });
    },
    [analyticsConsent, locale, repositories.userProfiles, themePreference],
  );
  const setEnabled = useCallback(
    async (nextEnabled: boolean) => {
      setErrorCode(undefined);
      if (nextEnabled) {
        if (!firebaseClient.configured) {
          setStatus('unavailable');
          setErrorCode('firebase/unavailable');
          return;
        }
        setStatus('connecting');
        try {
          if (!firebaseClient.currentUser()) {
            void telemetry.track('sign_in_started', { source_screen: 'cloud_backup' });
          }
          const nextUser =
            firebaseClient.currentUser() ?? (await firebaseClient.signInAnonymously());
          void telemetry.track('sign_in_completed', { source_screen: 'cloud_backup' });
          setUser(nextUser);
          upsertProfile(nextUser, true);
          repositories.settings.set(BACKUP_ENABLED_KEY, true);
          setEnabledState(true);
          setStatus('idle');
          void telemetry.track('cloud_backup_enabled', { source_screen: 'settings' });
        } catch {
          setErrorCode('firebase/unavailable');
          setStatus('error');
        }
      } else {
        const activeUser = firebaseClient.configured ? firebaseClient.currentUser() : null;
        if (activeUser) upsertProfile(activeUser, false);
        repositories.settings.set(BACKUP_ENABLED_KEY, false);
        setEnabledState(false);
        setStatus(firebaseClient.configured ? 'local_only' : 'unavailable');
        refreshSummary();
      }
    },
    [refreshSummary, repositories.settings, upsertProfile],
  );
  const linkGoogle = useCallback(async () => {
    setStatus('connecting');
    setErrorCode(undefined);
    try {
      void telemetry.track('sign_in_started', { source_screen: 'cloud_backup' });
      const linked = await firebaseClient.linkGoogleAccount();
      void telemetry.track('sign_in_completed', { source_screen: 'cloud_backup' });
      setUser(linked);
      upsertProfile(linked, true);
      setStatus('idle');
      await syncNow();
    } catch {
      setErrorCode('firebase/unavailable');
      setStatus('error');
    }
  }, [syncNow, upsertProfile]);
  const deleteCloudAccount = useCallback(async () => {
    setStatus('connecting');
    setErrorCode(undefined);
    try {
      void telemetry.track('account_deletion_started', { source_screen: 'settings' });
      await firebaseClient.deleteAccountAndCloudData();
      void telemetry.track('account_deletion_completed', { source_screen: 'settings' });
      repositories.settings.set(BACKUP_ENABLED_KEY, false);
      setEnabledState(false);
      setUser(null);
      setStatus(firebaseClient.configured ? 'local_only' : 'unavailable');
    } catch {
      setErrorCode('account/delete_failed');
      setStatus('error');
    }
  }, [repositories.settings]);

  useEffect(() => {
    void firebaseClient.initializeRemoteConfig();
    return firebaseClient.subscribeAuth(setUser);
  }, []);

  useEffect(() => {
    if (!enabled || !firebaseClient.configured || user || isOffline) return;
    const timeout = setTimeout(() => void setEnabled(true), 0);
    return () => clearTimeout(timeout);
  }, [enabled, isOffline, setEnabled, user]);

  useEffect(() => {
    if (!enabled || !user || isOffline) return;
    const initialSync = setTimeout(() => void syncNow(), 0);
    const interval = setInterval(() => void syncNow(), 5_000);
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void syncNow();
    });
    return () => {
      clearTimeout(initialSync);
      clearInterval(interval);
      subscription.remove();
    };
  }, [enabled, isOffline, syncNow, user]);

  const value = useMemo<CloudBackupContextValue>(
    () => ({
      configured: firebaseClient.configured,
      googleLinkAvailable:
        firebaseClient.configured && Boolean(runtimeConfig.firebase.googleWebClientId),
      enabled,
      user,
      status,
      summary,
      lastSyncAt,
      errorCode,
      setEnabled,
      syncNow,
      linkGoogle,
      deleteCloudAccount,
    }),
    [
      deleteCloudAccount,
      enabled,
      errorCode,
      lastSyncAt,
      linkGoogle,
      setEnabled,
      status,
      summary,
      syncNow,
      user,
    ],
  );
  return <CloudBackupContext.Provider value={value}>{children}</CloudBackupContext.Provider>;
}
