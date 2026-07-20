# Firebase setup and local-first synchronization

## Safety baseline

Firebase is optional. A build without Firebase service files starts in local-only mode, keeps using
SQLite, and does not load a Firebase adapter on web. Enabling backup is an explicit Settings action;
only then is an anonymous Firebase account created and the existing sync queue processed.

Do not commit `google-services.json`, `GoogleService-Info.plist`, `.firebaserc`, service-account
keys, or real OAuth identifiers. Firebase client configuration and OAuth client IDs are not server
secrets, but they are environment-specific and should still be supplied through the build
environment. Service-account credentials must never be placed in the mobile app.

React Native Firebase contains native code. It requires an Expo development build and does not run
in Expo Go.

## Firebase Console setup

1. Create or select a Firebase project.
2. Register Android package `com.kadirshn.hiddencost`.
3. Add development and release SHA-1/SHA-256 fingerprints before enabling Google sign-in.
4. Download `google-services.json` to a secure path outside the repository.
5. Enable Anonymous Authentication and, when account linking is wanted, Google Authentication.
6. Create Firestore and deploy this repository's rules and indexes.
7. Create the Remote Config keys listed below, or rely on the safe in-app defaults.
8. Deploy the reviewed Firestore rules. The mobile account-deletion flow works on the Spark plan;
   the optional callable implementation under `functions/` is reserved for a future backend rollout.

For iOS, register the final bundle identifier, download `GoogleService-Info.plist`, and provide
`IOS_BUNDLE_IDENTIFIER`. No bundle identifier or credential is invented in this repository.

## Local environment and development build

Example PowerShell values; replace every placeholder with values from your Firebase project:

```powershell
$env:EXPO_PUBLIC_APP_ENV='development'
$env:EXPO_PUBLIC_FIREBASE_ENABLED='true'
$env:FIREBASE_GOOGLE_SERVICES_FILE='D:\secure\hidden-cost\google-services.json'
$env:EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID='<client_type_3_web_client_id>'
```

Optional iOS values:

```powershell
$env:FIREBASE_GOOGLE_SERVICE_INFO_FILE='D:\secure\hidden-cost\GoogleService-Info.plist'
$env:IOS_BUNDLE_IDENTIFIER='<registered_bundle_identifier>'
```

`app.config.ts` adds React Native Firebase, Google Sign-In, and static iOS linking plugins only when
Firebase is requested and at least one native service file is supplied. The resolved paths are
passed to Expo's `android.googleServicesFile` and `ios.googleServicesFile`.

After adding or changing native modules or service files, create a clean development build:

```powershell
node node_modules/expo/bin/cli prebuild --clean
node node_modules/expo/bin/cli run:android
node node_modules/expo/bin/cli start --dev-client
```

Alternatively use the existing EAS `development` profile. Store service files as EAS file secrets
and map the same environment variable names; never paste their contents into `app.config.ts`.

## Emulator Suite and rules tests

Copy `.firebaserc.example` to the ignored `.firebaserc` only for local development, then run:

```powershell
$env:EXPO_PUBLIC_FIREBASE_USE_EMULATORS='true'
$env:EXPO_PUBLIC_FIREBASE_EMULATOR_HOST='10.0.2.2'
npm run firebase:emulators
```

`10.0.2.2` reaches the host from the Android emulator. Use the host LAN address for a physical
device. Ports are Auth `9099`, Firestore `8080`, Functions `5001`, and Emulator UI `4000`.

Run the isolated rules suite with `npm run test:rules`. It uses `demo-hidden-cost` and verifies
authenticated owner access, cross-user denial, unauthenticated denial, immutable ownership,
soft-delete tombstones, and monotonic revisions. It never connects to production.

## Data flow and conflict boundary

1. Repositories commit data and a coalesced `sync_queue` intent in one SQLite transaction.
2. UI renders only from SQLite.
3. Backup opt-in creates or reuses a stable anonymous Firebase UID.
4. The worker runs on opt-in, every five seconds while active, foreground, manual retry, and network
   recovery.
5. Firestore transactions compare `revision`, then ISO `updatedAt`.
6. Equal writes are idempotent; a newer local revision replaces an older cloud revision.
7. A newer cloud revision marks the entity `conflict` and blocks overwrite for a future resolution
   screen.
8. Transient failures retry with jittered exponential backoff capped at 15 minutes.
9. Soft deletes are synchronized as revisioned tombstones, not client physical deletes.

Cloud paths are always rooted under the authenticated UID:

```text
users/{uid}/projects/{projectId}
users/{uid}/projects/{projectId}/costItems/{costItemId}
users/{uid}/projects/{projectId}/scenarioOverrides/{overrideId}
users/{uid}/settings/profile
```

Rules derive authorization from the path and `request.auth.uid`; another user's `ownerId` is
rejected. The client performs no cross-user collection queries.

## Google linking and Spark-plan deletion

The Google action links a credential to the current anonymous user with `linkWithCredential`; it
does not switch to a separate UID. The action is hidden until a web OAuth client ID is supplied.
Enable Google Auth and select the `client_type: 3` client ID from Firebase configuration.

The app deletes the signed-in user's known Firestore tree in bounded write batches, then deletes the
Firebase Auth user. Every path is derived from `currentUser.uid`; Firestore rules also require the
same authenticated owner on each delete. A linked Google user is reauthenticated immediately before
deletion. This flow does not require Cloud Functions or the Blaze plan. Local SQLite calculations are
deliberately preserved and the confirmation explains this.

`functions/src/index.ts` retains an authenticated callable alternative for a future backend rollout,
but the current mobile client does not depend on it. App Check enforcement remains an explicit
console rollout after metrics validation. See [App Check setup](APP_CHECK_SETUP.md).

```powershell
firebase deploy --only firestore:rules,firestore:indexes
```

## Remote Config defaults

Defaults are set before fetch and fetch failure is non-blocking: all ad/reward switches are off,
`max_compare_items` is 3, cloud backup capability is on, catalog version is 1, maintenance and force
update are off, and minimum supported version is `1.0.0`. Analytics collection defaults to disabled
and is controlled by the versioned Settings consent.

## Manual acceptance checks

1. Start without Firebase values; create and calculate a project offline.
2. Restart and confirm it remains while Settings reports Firebase unavailable.
3. In an emulator-backed development build, opt in and verify anonymous auth plus queued writes.
4. Disable network, edit a project, restore network, and verify the queue drains.
5. Use a second emulator user and confirm reads under the first UID are denied.
6. Delete a project and verify a higher-revision Firestore tombstone.
7. Link Google and confirm the Firebase UID does not change.
8. Delete the cloud account and confirm cloud/Auth removal while SQLite remains usable.
