import { getAnalytics, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import {
  connectAuthEmulator,
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  getIdToken,
  linkWithCredential,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reload,
  signInAnonymously,
  type User,
} from '@react-native-firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getFirestore,
  getDocs,
  runTransaction,
  writeBatch,
} from '@react-native-firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from '@react-native-firebase/functions';
import { fetchAndActivate, getRemoteConfig } from '@react-native-firebase/remote-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { runtimeConfig } from '@/config/runtime-config';
import { initializeAppProtection } from '@/services/observability/app-protection';

import { deleteCloudDocumentTree, type CloudDeletionAdapter } from './cloud-account-deletion';
import { buildCloudDocumentMutation, resolveCloudMutation } from './cloud-document';
import {
  FirebaseOperationError,
  FirebaseUnavailableError,
  type CloudMutationResult,
  type CloudUser,
  type FirebaseClient,
} from './contracts';
import { GoogleAccountLinkRestError, linkGoogleAccountWithRest } from './google-account-link';
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
  if (typeof error === 'object' && error && 'code' in error) {
    if (typeof error.code === 'string') return error.code;
    if (typeof error.code === 'number') return String(error.code);
  }
  return 'firebase/unknown';
}

function diagnosticReason(error: unknown): string | undefined {
  if (typeof error !== 'object' || !error) return undefined;
  const details = ['message', 'nativeErrorMessage']
    .flatMap((key) => {
      if (!(key in error)) return [];
      const value = error[key as keyof typeof error];
      return typeof value === 'string' ? [value] : [];
    })
    .join(' ')
    .toUpperCase();
  const knownReasons: readonly (readonly [string, string])[] = [
    ['CONFIGURATION_NOT_FOUND', 'configuration_not_found'],
    ['OPERATION_NOT_ALLOWED', 'operation_not_allowed'],
    ['INVALID_IDP_RESPONSE', 'invalid_idp_response'],
    ['CREDENTIAL_ALREADY_IN_USE', 'credential_already_in_use'],
    ['NETWORK REQUEST FAILED', 'network_request_failed'],
    ['NETWORK_ERROR', 'network_error'],
    ['API KEY NOT VALID', 'api_key_not_valid'],
    ['APP_NOT_AUTHORIZED', 'app_not_authorized'],
    ['UNKNOWN CALLING PACKAGE', 'unknown_calling_package'],
    ['TOO_MANY_ATTEMPTS_TRY_LATER', 'too_many_attempts'],
    ['INTERNAL ERROR', 'internal_error'],
  ];
  return knownReasons.find(([marker]) => details.includes(marker))?.[1];
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
    let googleIdToken: string | undefined;
    try {
      GoogleSignin.configure({ webClientId: runtimeConfig.firebase.googleWebClientId });
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (response.type === 'cancelled') {
        throw new FirebaseOperationError('auth/google-sign-in-cancelled');
      }
      googleIdToken = response.data?.idToken ?? undefined;
      if (!googleIdToken) throw new FirebaseOperationError('auth/google-id-token-missing');
      const credential = GoogleAuthProvider.credential(googleIdToken);
      const linked = (await linkWithCredential(current, credential)).user;
      await reload(linked);
      return toCloudUser(getAuth().currentUser ?? linked);
    } catch (error) {
      if (error instanceof FirebaseOperationError) throw error;
      if (errorCode(error) === 'auth/unknown' && googleIdToken) {
        return this.linkGoogleAccountAfterUnknownNativeError(current, googleIdToken);
      }
      throw new FirebaseOperationError(errorCode(error), diagnosticReason(error));
    }
  }

  private async linkGoogleAccountAfterUnknownNativeError(
    current: User,
    googleIdToken: string,
  ): Promise<CloudUser> {
    try {
      // The native call may have reached the backend before losing its result.
      await reload(current);
      if (current.providerData.some(({ providerId }) => providerId === 'google.com')) {
        return toCloudUser(current);
      }
      const apiKey = getApp().options.apiKey;
      if (!apiKey) throw new FirebaseOperationError('auth/firebase-api-key-missing');
      await linkGoogleAccountWithRest({
        apiKey,
        firebaseIdToken: await getIdToken(current, true),
        googleIdToken,
        expectedUid: current.uid,
      });
      await reload(current);
      return toCloudUser(current);
    } catch (error) {
      if (error instanceof FirebaseOperationError) throw error;
      if (error instanceof GoogleAccountLinkRestError) {
        const collision =
          error.code === 'FEDERATED_USER_ID_ALREADY_LINKED' || error.code === 'EMAIL_EXISTS';
        throw new FirebaseOperationError(
          collision ? 'auth/credential-already-in-use' : 'auth/unknown',
          error.code.toLowerCase(),
        );
      }
      throw new FirebaseOperationError(errorCode(error), diagnosticReason(error));
    }
  }

  async applyMutation(
    uid: string,
    record: Parameters<FirebaseClient['applyMutation']>[1],
  ): Promise<CloudMutationResult> {
    this.assertConfigured();
    await initializeAppProtection();
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
      });
    } catch {
      // Defaults are safe; Firebase failure must never block local initialization.
      return REMOTE_CONFIG_DEFAULTS;
    }
  }

  async deleteAccountAndCloudData(): Promise<void> {
    this.assertConfigured();
    await initializeAppProtection();
    this.connectEmulators();
    try {
      const current = getAuth().currentUser;
      if (!current) throw new FirebaseOperationError('auth/no-current-user');
      if (current.providerData.some(({ providerId }) => providerId === 'google.com')) {
        if (!runtimeConfig.firebase.googleWebClientId) {
          throw new FirebaseOperationError('auth/google-client-id-missing');
        }
        GoogleSignin.configure({ webClientId: runtimeConfig.firebase.googleWebClientId });
        const response = await GoogleSignin.signIn();
        if (response.type === 'cancelled') {
          throw new FirebaseOperationError('auth/google-sign-in-cancelled');
        }
        const idToken = response.data?.idToken;
        if (!idToken) throw new FirebaseOperationError('auth/google-id-token-missing');
        await reauthenticateWithCredential(current, GoogleAuthProvider.credential(idToken));
      }
      const firestore = getFirestore();
      const adapter: CloudDeletionAdapter = {
        listDocumentPaths: async (collectionPath) => {
          const snapshot = await getDocs(collection(firestore, collectionPath));
          return snapshot.docs.map((snapshotDocument) => snapshotDocument.ref.path);
        },
        deleteDocumentPaths: async (documentPaths) => {
          const batch = writeBatch(firestore);
          documentPaths.forEach((path) => batch.delete(doc(firestore, path)));
          await batch.commit();
        },
      };
      await deleteCloudDocumentTree(current.uid, adapter);
      await deleteUser(current);
    } catch (error) {
      if (error instanceof FirebaseOperationError) throw error;
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
