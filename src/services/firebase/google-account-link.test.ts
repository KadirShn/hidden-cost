import { describe, expect, it, jest } from '@jest/globals';

import { GoogleAccountLinkRestError, linkGoogleAccountWithRest } from './google-account-link';

function response(body: object, ok = true): Response {
  return { ok, json: async () => body } as Response;
}

describe('linkGoogleAccountWithRest', () => {
  it('links the Google credential to the current Firebase UID', async () => {
    const request = jest.fn<typeof fetch>(async () => response({ localId: 'anonymous-uid' }));

    await expect(
      linkGoogleAccountWithRest(
        {
          apiKey: 'public-api-key',
          firebaseIdToken: 'firebase-token',
          googleIdToken: 'google-token',
          expectedUid: 'anonymous-uid',
        },
        request,
      ),
    ).resolves.toEqual({ localId: 'anonymous-uid' });

    const [, init] = request.mock.calls[0];
    const body = JSON.parse(String(init?.body));
    expect(body).toMatchObject({
      idToken: 'firebase-token',
      postBody: 'id_token=google-token&providerId=google.com',
      returnSecureToken: true,
    });
  });

  it('rejects a response that does not preserve the current UID', async () => {
    const request = jest.fn<typeof fetch>(async () => response({ localId: 'different-uid' }));

    await expect(
      linkGoogleAccountWithRest(
        {
          apiKey: 'public-api-key',
          firebaseIdToken: 'firebase-token',
          googleIdToken: 'google-token',
          expectedUid: 'anonymous-uid',
        },
        request,
      ),
    ).rejects.toEqual(new GoogleAccountLinkRestError('UID_MISMATCH'));
  });

  it('returns only the Firebase error code and never includes credential values', async () => {
    const request = jest.fn<typeof fetch>(async () =>
      response({ error: { message: 'FEDERATED_USER_ID_ALREADY_LINKED' } }, false),
    );

    await expect(
      linkGoogleAccountWithRest(
        {
          apiKey: 'public-api-key',
          firebaseIdToken: 'firebase-secret-token',
          googleIdToken: 'google-secret-token',
          expectedUid: 'anonymous-uid',
        },
        request,
      ),
    ).rejects.toEqual(new GoogleAccountLinkRestError('FEDERATED_USER_ID_ALREADY_LINKED'));
  });
});
