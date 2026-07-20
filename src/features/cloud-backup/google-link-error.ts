import { FirebaseOperationError } from '@/services/firebase/contracts';

export type GoogleLinkError = 'cancelled' | 'credential_in_use' | 'configuration' | 'unknown';

export function resolveGoogleLinkError(error: unknown): GoogleLinkError {
  const code = error instanceof FirebaseOperationError ? error.code : 'firebase/unknown';

  if (['SIGN_IN_CANCELLED', '12501', 'auth/google-sign-in-cancelled'].includes(code)) {
    return 'cancelled';
  }
  if (
    ['auth/credential-already-in-use', 'auth/account-exists-with-different-credential'].includes(
      code,
    )
  ) {
    return 'credential_in_use';
  }
  if (
    [
      'DEVELOPER_ERROR',
      '10',
      'auth/google-client-id-missing',
      'auth/google-id-token-missing',
    ].includes(code)
  ) {
    return 'configuration';
  }
  return 'unknown';
}
