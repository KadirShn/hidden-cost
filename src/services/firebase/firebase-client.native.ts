import { getAnalytics, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  type User,
} from '@react-native-firebase/auth';
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  runTransaction,
} from '@react-native-firebase/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from '@react-native-firebase/functions';
import {
  fetchAndActivate,
  getBoolean,
  getNumber,
  getRemoteConfig,
} from '@react-native-firebase/remote-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { runtimeConfig } from '@/config/runtime-config';

import { buildCloudDocumentMutation, resolveCloudMutation } from './cloud-document';
import {
  FirebaseOperationError,
  FirebaseUnavailableError,
  type CloudMutationResult,
  type CloudUser,
  type FirebaseClient,
} from './contracts';
import { REMOTE_CONFIG_DEFAULTS, type RemoteConfigValues } from './remote-config-defaults';

function toCloudUser(user: User): CloudUser {
  return {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
    displayName: user.displayName ?? undefined,
    email: user.email ?? undefined,
  };
}

function errorCode(error: unknown): string {
  if (typeof error === 'object' && error && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return 'firebase/unknown';
}

class NativeFirebaseClient implements FirebaseClient {
  readonly configured: boolean;
  private emulatorsConnected = false;

  constructor() {
    let hasDefaultApp = false;
    if (runtimeConfig.firebase.enabled) {
      try {
        getApp();
        hasDefaultApp = true;
      } catch {
        hasDefaultApp = false;
      }
    }
    this.configured = hasDefaultApp;
    if (this.configured && runtimeConfig.firebase.googleWebClientId) {
      GoogleSignin.configure({ webClientId: runtimeConfig.firebase.googleWebClientId });
    }
  }

  currentUser(): CloudUser | null {
    this.assertConfigured();
    const user = getAuth().currentUser;
    return user ? toCloudUser(user) : null;
  }

  subscribeAuth(listener: (user: CloudUser | null) => void): () => void {
    if (!this.configured) {
      listener(null);
      return () => undefined;
    }
    this.connectEmulators();
    return onAuthStateChanged(getAuth(), (user) => listener(user ? toCloudUser(user) : null));
  }

  async signInAnonymously(): Promise<CloudUser> {
    this.assertConfigured();
    this.connectEmulators();
    try {
      const existing = getAuth().currentUser;
      if (existing) return toCloudUser(existing);
      return toCloudUser((await signInAnonymously(getAuth())).user);
    } catch (error) {
      throw new FirebaseOperationError(errorCode(error));
    }
  }

  async linkGoogleAccount(): Promise<CloudUser> {
    this.assertConfigured();
    if (!runtimeConfig.firebase.googleWebClientId) {
      throw new FirebaseOperationError('auth/google-client-id-missing');
    }
    const current = getAuth().currentUser;
    if (!current) throw new FirebaseOperationError('auth/no-current-user');
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new FirebaseOperationError('auth/google-id-token-missing');
      const credential = GoogleAuthProvider.credential(idToken);
      return toCloudUser((await linkWithCredential(current, credential)).user);
    } catch (error) {
      if (error instanceof FirebaseOperationError) throw error;
      throw new FirebaseOperationError(errorCode(error));
    }
  }

  async applyMutation(
    uid: string,
    record: Parameters<FirebaseClient['applyMutation']>[1],
  ): Promise<CloudMutationResult> {
    this.assertConfigured();
    this.connectEmulators();
    const mutation = buildCloudDocumentMutation(uid, record);
    try {
      return await runTransaction(getFirestore(), async (transaction) => {
        const reference = doc(getFirestore(), mutation.path);
        const snapshot = await transaction.get(reference);
        const resolution = resolveCloudMutation(
          mutation,
          snapshot.exists() ? snapshot.data() : undefined,
        );
        if (resolution === 'remote_newer') return 'remote_newer';
        if (resolution === 'already_applied') return 'already_applied';
        transaction.set(reference, mutation.data);
        return 'applied';
      });
    } catch (error) {
      throw new FirebaseOperationError(errorCode(error));
    }
  }

  async initializeRemoteConfig(): Promise<RemoteConfigValues> {
    if (!this.configured) return REMOTE_CONFIG_DEFAULTS;
    this.connectEmulators();
    try {
      await setAnalyticsCollectionEnabled(getAnalytics(), false);
      const config = getRemoteConfig();
      config.defaultConfig = REMOTE_CONFIG_DEFAULTS;
      config.settings = {
        ...config.settings,
        minimumFetchIntervalMillis: __DEV__ ? 60_000 : 12 * 60 * 60_000,
      };
      await fetchAndActivate(config);
      return Object.freeze({
        ...REMOTE_CONFIG_DEFAULTS,
        ads_enabled: getBoolean(config, 'ads_enabled'),
        native_ads_enabled: getBoolean(config, 'native_ads_enabled'),
        interstitial_ads_enabled: getBoolean(config, 'interstitial_ads_enabled'),
        rewarded_export_enabled: getBoolean(config, 'rewarded_export_enabled'),
        interstitial_min_completed_calculations: getNumber(
          config,
          'interstitial_min_completed_calculations',
        ),
        interstitial_cooldown_minutes: getNumber(config, 'interstitial_cooldown_minutes'),
      });
    } catch {
      // Defaults are safe; Firebase failure must never block local initialization.
      return REMOTE_CONFIG_DEFAULTS;
    }
  }

  async deleteAccountAndCloudData(): Promise<void> {
    this.assertConfigured();
    this.connectEmulators();
    try {
      await httpsCallable(getFunctions(), 'deleteAccountAndData')();
    } catch (error) {
      throw new FirebaseOperationError(errorCode(error));
    }
  }

  private assertConfigured(): void {
    if (!this.configured) throw new FirebaseUnavailableError();
  }

  private connectEmulators(): void {
    if (!this.configured || !runtimeConfig.firebase.useEmulators || this.emulatorsConnected) return;
    const host = runtimeConfig.firebase.emulatorHost;
    connectAuthEmulator(getAuth(), `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(getFirestore(), host, 8080);
    connectFunctionsEmulator(getFunctions(), host, 5001);
    this.emulatorsConnected = true;
  }
}

export const firebaseClient: FirebaseClient = new NativeFirebaseClient();
