import type { SyncQueueRecord } from '@/data/repositories/types';

export type CloudUser = {
  uid: string;
  isAnonymous: boolean;
  displayName?: string;
  email?: string;
};

export type CloudMutationResult = 'applied' | 'already_applied' | 'remote_newer';

export interface FirebaseClient {
  readonly configured: boolean;
  currentUser(): CloudUser | null;
  subscribeAuth(listener: (user: CloudUser | null) => void): () => void;
  signInAnonymously(): Promise<CloudUser>;
  linkGoogleAccount(): Promise<CloudUser>;
  applyMutation(uid: string, record: SyncQueueRecord): Promise<CloudMutationResult>;
  initializeRemoteConfig(): Promise<void>;
  deleteAccountAndCloudData(): Promise<void>;
}

export class FirebaseUnavailableError extends Error {
  constructor() {
    super('Firebase is not configured for this build');
    this.name = 'FirebaseUnavailableError';
  }
}

export class FirebaseOperationError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'FirebaseOperationError';
  }
}
