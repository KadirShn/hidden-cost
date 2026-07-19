# Firebase App Check Setup

Phase 9 initializes Firebase App Check before Firestore synchronization and callable account
deletion. It does **not** enable server-side enforcement automatically. Local calculations remain
available if App Check or Firebase is unavailable.

## Provider separation

| Build environment | Android provider | Apple provider | Debug token allowed |
| --- | --- | --- | --- |
| `development` | Debug | Debug | Yes; private Firebase Console registration only |
| `preview` | Debug | Debug | Yes; private internal distribution only |
| `production` | Play Integrity | App Attest with DeviceCheck fallback | Never |

The provider is selected from `EXPO_PUBLIC_APP_ENV`; no runtime Remote Config value can downgrade a
production build to the debug provider. No debug token is stored in source or public Expo config.
During development the native SDK emits a token; register it under Firebase Console → App Check →
Manage debug tokens. Treat that token like a credential, do not commit or share it, and revoke it
when a device or CI environment is retired.

## Android Play Integrity registration

1. Link the Firebase Google Cloud project to the application in Google Play Console → App integrity
   → Play Integrity API.
2. Register the Android application in Firebase Console → App Check with Play Integrity.
3. Add every production signing certificate SHA-256 fingerprint, including Play App Signing.
4. Confirm package name and Firebase Android app match the production artifact.
5. Build a signed internal/release artifact and verify valid App Check metrics before enforcement.

## Safe enforcement rollout

Do not enable enforcement immediately after shipping the SDK.

1. Deploy the App Check-enabled clients with enforcement **off**.
2. Observe valid/invalid/missing request metrics for at least one representative release window.
3. Verify development, preview, production, account deletion, background sync, and offline recovery.
4. Confirm supported production installs receive valid Play Integrity tokens.
5. Enable enforcement for callable Cloud Functions first in a controlled window.
6. Monitor account deletion failures and roll back enforcement if valid users are rejected.
7. Enable Cloud Firestore enforcement only after sync metrics are healthy.
8. Keep Authentication enforcement off unless its current preview limitations are explicitly
   accepted and tested.

Rollback is performed in Firebase Console by disabling enforcement for the affected product; an app
release is not required. App Check complements Firebase Auth and Firestore ownership rules—it does
not replace either control.

## Development verification

Use an Expo development build; Expo Go does not contain the native App Check module. With Firebase
development configuration present:

1. Launch the app and trigger cloud backup.
2. Copy the debug token from native device logs into the Firebase App Check debug-token allowlist.
3. Relaunch and confirm App Check metrics show a valid request.
4. Confirm a production config resolves to `playIntegrity` with the automated unit test.
5. Never enable enforcement against a project until every supported build profile has been tested.
