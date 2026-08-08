# Android internal testing preparation

## Release baseline

- Candidate application ID: `com.kadirshn.hiddencost`. The owner must approve it before the first
  Play upload; changing it later creates a different Play application.
- User-facing version: `2.0.0`. Local seed `versionCode` is `2`; EAS is configured with remote
  versioning and increments the Android version code for each production build.
- The `production` EAS profile creates an Android App Bundle (`.aab`) with store distribution.
- The `internal` submit profile targets Play internal testing with `draft` status. Submission is a
  separate, explicit command and is not run as part of build.
- Credentials, an EAS project ID, live service files, and store publication are
  intentionally absent from the repository.

## Owner-supplied release inputs

- [ ] Confirm the legal developer/publisher name and ownership of `com.kadirshn.hiddencost`.
- [ ] Provide the final public HTTPS privacy-policy URL.
- [ ] Provide the final public HTTPS account/data-deletion URL.
- [ ] Create/link the Expo EAS project and record its project ID through `eas init`.
- [ ] Confirm Google Play developer account and create the Play application manually.
- [ ] Choose EAS-managed Android upload credentials or securely provide the existing upload key.
- [ ] Enable Google Play App Signing and back up upload-key recovery information.
- [ ] Configure the production Firebase Android app/service file if cloud features will ship.
- [ ] Supply tester Google accounts and the internal-test feedback contact.
- [ ] Complete legal review of the policy, terms, disclaimer, retention periods, and Data Safety
  answers.

Production config rejects missing/placeholder legal URLs. A Firebase-enabled production build also
rejects a missing Android service file. Use EAS environment variables/file secrets; never commit
these values.

## Signing and credentials

1. Install/login to EAS CLI and link the project with `npx eas-cli@latest init` only after the owner
   selects the Expo organization.
2. Run `npx eas-cli@latest credentials -p android` and choose an EAS-managed upload keystore unless
   an existing Play upload key must be preserved.
3. Enroll in Google Play App Signing. Play retains the app-signing key; EAS/local tooling uses the
   upload key.
4. Keep keystores, passwords, service-account JSON, `google-services.json`, and recovery records in
   the approved secret manager. The repository ignores known credential filenames.
5. The first Play upload must be completed manually in Play Console. Configure API/service-account
   submission only after the Play app exists and grant only internal-release permissions.

No Google account password, keystore, or Play service-account key belongs in `eas.json`.

## Production Firebase checklist

- [ ] Use a dedicated production Firebase project and register exactly
  `com.kadirshn.hiddencost`.
- [ ] Store `google-services.json` as an EAS **file** environment variable mapped to
  `FIREBASE_GOOGLE_SERVICES_FILE`.
- [ ] Set `EXPO_PUBLIC_FIREBASE_ENABLED=true` only when the production file and services are ready.
- [ ] Add Play upload/app-signing SHA-1 and SHA-256 fingerprints.
- [ ] Enable Anonymous Auth and Google Auth only if cloud backup/account linking will ship.
- [ ] Configure the correct web OAuth client ID and consent screen.
- [ ] Deploy reviewed Firestore rules/indexes and the `deleteAccountAndData` callable function.
- [ ] Verify a second UID cannot read the first UID's documents.
- [ ] Set Analytics retention/consent behavior and Crashlytics collection expectations.
- [ ] Create Remote Config parameters from the safe-default table below; do not enable ads during
  the first binary smoke test.

Local-only operation remains valid when Firebase is disabled. Analytics, Crashlytics, App Check,
Auth, sync, and Remote Config adapters now return before importing native Firebase modules in that
mode.

## App Check rollout

1. Internal build: register Play Integrity, keep enforcement **off**, and confirm valid requests in
   App Check metrics.
2. Verify Auth, Firestore sync, Remote Config fetch, and account deletion on Play-installed builds.
3. Investigate unknown/invalid traffic and ensure development/debug builds use only the debug
   provider.
4. Enforce Firestore first, observe at least 48 hours, then Functions. Keep an owner-approved
   rollback window.
5. If legitimate traffic is rejected, disable enforcement in Firebase Console; never weaken
   Firestore ownership rules as an App Check workaround.

## Remote Config safe defaults

| Key | Default | Release meaning |
| --- | ---: | --- |
| `max_compare_items` | `3` | Domain/UI maximum |
| `cloud_backup_enabled` | `true` | Capability available; user opt-in still required |
| `template_catalog_version` | `1` | Bundled catalog baseline |
| `maintenance_mode` | `false` | Normal operation |
| `minimum_supported_version` | `1.0.0` | No forced upgrade by itself |
| `force_update_enabled` | `false` | Never block startup by default |

Fetch failure always retains these local defaults. Activate parameters without values first, then
change one kill-switched feature at a time after internal verification.

## Production build commands

Read-only preparation checks:

```powershell
npx eas-cli@latest whoami
npx eas-cli@latest env:list --environment production
npx eas-cli@latest build:version:get -p android
$env:EAS_BUILD_PLATFORM='android'
$env:EXPO_PUBLIC_APP_ENV='production'
npx expo config --type public
```

After every owner-supplied input is complete and build-minute usage is approved:

```powershell
npx eas-cli@latest build -p android --profile production
```

This produces an AAB and does not submit it. The first Play upload is manual. A later automated
internal upload is still an external action and requires explicit approval:

```powershell
npx eas-cli@latest submit -p android --profile internal --latest
```

For a local signed AAB, use the approved upload keystore and run `gradlew bundleRelease`; do not
create or commit an ad-hoc production key.

## Internal testing smoke tests

- [ ] Install from the Play internal-testing link, not by sideloading the final candidate.
- [ ] Cold start and complete onboarding in Turkish and English.
- [ ] Enable airplane mode; create, calculate, save, reopen, edit, duplicate, archive, and delete a
  motorcycle calculation.
- [ ] Restart and confirm local persistence; verify Firebase-disabled local-only startup separately.
- [ ] Test cloud opt-in, offline queue, reconnect sync, second-user isolation, soft-delete sync, and
  account/cloud deletion when Firebase ships.
- [ ] Test low/base/high scenarios, three-project comparison, currency/unit warnings, PDF/share, and
  export failure fallback.
- [ ] Test maximum font scale, TalkBack, reduced motion, dark/light/system themes, and smallest
  supported screen.
- [x] Complete the Maestro offline flow on the rebuilt preview release APK.
- [ ] Verify no sensitive cost/title/note/email/free text in Analytics or Crashlytics.

## Analytics and Crashlytics verification

Use a production-configured internal build and explicit analytics consent. Confirm allowlisted
events in Firebase DebugView without enabling development-only test controls in release. Disable
consent and confirm collection stops. Generate a controlled non-fatal from a development build only;
for the internal release, verify a naturally captured typed test error through a dedicated QA build
or Firebase dashboard rather than shipping a crash button.

Crash reports must contain typed codes and redacted categorical context only. Confirm release name
and version code map to `2.0.0` plus the EAS-managed code. Remove the QA build/device from production
metrics after verification.

## Rollback plan

- Before submission: cancel/discard the EAS build; no user impact.
- Internal track: halt the draft/release in Play Console and issue a corrected AAB with a higher
  version code. Android cannot replace an uploaded code or downgrade installed data safely.
- Ads/remote feature incident: set `ads_enabled=false` and affected switches off. Defaults already
  fail closed.
- App Check incident: disable enforcement while retaining Auth/Firestore ownership rules.
- Firebase backend incident: roll back rules/functions from version control, then run emulator and
  owner-isolation tests before redeploying.
- Database incident: ship a forward-only migration; never reset or downgrade the user's SQLite DB.
- Preserve the last known-good AAB, commit, configuration export, rules, and release notes.

## EAS Update suitability

EAS Update is **not currently configured**: `expo-updates`, an EAS project/update URL, runtime
version, and build channels are absent. This is safe for the first internal release and avoids an
unreviewed OTA path. If adopted later, configure it as a separate native release, use an
`appVersion` runtime policy, preview/production channels, staged rollout, and error monitoring.

OTA updates may change JavaScript/assets only when compatible with the installed native runtime.
Native packages, permissions, Firebase plugins, service files, app identifiers, and Data
Safety-impacting behavior require a new AAB. Roll back a bad OTA through EAS Update and still retain
the Play rollback plan for native failures.
