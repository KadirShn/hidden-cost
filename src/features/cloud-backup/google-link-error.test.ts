import { describe, expect, it } from '@jest/globals';

import { FirebaseOperationError } from '@/services/firebase/contracts';

import { resolveGoogleLinkError } from './google-link-error';

describe('resolveGoogleLinkError', () => {
  it('keeps actionable Google and Firebase link failures distinct', () => {
    expect(resolveGoogleLinkError(new FirebaseOperationError('SIGN_IN_CANCELLED'))).toBe(
      'cancelled',
    );
    expect(
      resolveGoogleLinkError(new FirebaseOperationError('auth/credential-already-in-use')),
    ).toBe('credential_in_use');
    expect(resolveGoogleLinkError(new FirebaseOperationError('DEVELOPER_ERROR'))).toBe(
      'configuration',
    );
    expect(resolveGoogleLinkError(new Error('network'))).toBe('unknown');
  });

  it('keeps an allow-listed native reason available for safe development diagnostics', () => {
    const error = new FirebaseOperationError('auth/unknown', 'operation_not_allowed');

    expect(error.diagnosticReason).toBe('operation_not_allowed');
    expect(resolveGoogleLinkError(error)).toBe('unknown');
  });
});
