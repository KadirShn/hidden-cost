export type GoogleAccountLinkResponse = Readonly<{
  localId: string;
}>;

type FirebaseErrorPayload = Readonly<{
  error?: Readonly<{
    message?: string;
  }>;
}>;

export class GoogleAccountLinkRestError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = 'GoogleAccountLinkRestError';
  }
}

export async function linkGoogleAccountWithRest(
  input: Readonly<{
    apiKey: string;
    firebaseIdToken: string;
    googleIdToken: string;
    expectedUid: string;
  }>,
  request: typeof fetch = fetch,
): Promise<GoogleAccountLinkResponse> {
  const response = await request(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${encodeURIComponent(input.apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: input.firebaseIdToken,
        postBody: `id_token=${encodeURIComponent(input.googleIdToken)}&providerId=google.com`,
        requestUri: 'http://localhost',
        returnIdpCredential: true,
        returnSecureToken: true,
      }),
    },
  );
  const payload = (await response.json()) as GoogleAccountLinkResponse & FirebaseErrorPayload;
  if (!response.ok) {
    throw new GoogleAccountLinkRestError(payload.error?.message ?? 'REST_LINK_FAILED');
  }
  if (payload.localId !== input.expectedUid) {
    throw new GoogleAccountLinkRestError('UID_MISMATCH');
  }
  return { localId: payload.localId };
}
