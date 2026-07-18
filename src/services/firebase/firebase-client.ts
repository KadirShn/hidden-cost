import {
  FirebaseUnavailableError,
  type CloudMutationResult,
  type CloudUser,
  type FirebaseClient,
} from './contracts';

class DisabledFirebaseClient implements FirebaseClient {
  readonly configured = false;

  currentUser(): CloudUser | null {
    return null;
  }

  subscribeAuth(listener: (user: CloudUser | null) => void): () => void {
    listener(null);
    return () => undefined;
  }

  async signInAnonymously(): Promise<CloudUser> {
    throw new FirebaseUnavailableError();
  }

  async linkGoogleAccount(): Promise<CloudUser> {
    throw new FirebaseUnavailableError();
  }

  async applyMutation(): Promise<CloudMutationResult> {
    throw new FirebaseUnavailableError();
  }

  async initializeRemoteConfig(): Promise<void> {
    return Promise.resolve();
  }

  async deleteAccountAndCloudData(): Promise<void> {
    throw new FirebaseUnavailableError();
  }
}

export const firebaseClient: FirebaseClient = new DisabledFirebaseClient();
