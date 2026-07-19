# Android internal testing release checklist

Checked items are repository-verified. Unchecked items require owner input, credentials, a rebuilt
binary, a physical device, or an external console action.

## Identity and versioning

- [x] Display name is consistently `Hidden Cost`.
- [x] Candidate Android application ID is `com.kadirshn.hiddencost`.
- [ ] Owner confirms the application ID and legal publisher before the first Play upload.
- [x] User-facing version is `1.0.0`; local initial `versionCode` is `1`.
- [x] EAS uses remote version source and production `versionCode` auto-increment.

## Build and signing

- [x] Production EAS profile explicitly produces an AAB with store distribution.
- [x] Internal submit profile targets Play internal track with draft release status.
- [ ] Expo organization/EAS project is linked and production environment variables are present.
- [ ] Android upload key strategy is approved and Play App Signing is enabled.
- [ ] Production AAB is generated, fingerprinted, retained, and manually inspected.
- [ ] First Play upload is completed manually; no automated submission without approval.

## Automated quality

- [x] TypeScript and ESLint pass locally.
- [x] Unit, integration, UI, repository, sync-chaos, and ad-chaos tests pass locally.
- [x] Firestore rules tests pass on Java 21.
- [x] Preview release APK assembles and installs locally.
- [ ] Maestro offline smoke test passes after rebuilding the latest local-only startup guards.
- [ ] CI quality, Firestore-rules, Android AAB/APK, and Maestro jobs are green on the release commit.

## Firebase, App Check, and Remote Config

- [ ] Dedicated production Firebase project and exact Android package are confirmed.
- [ ] Production service file is stored as an EAS file secret; no credential is committed.
- [ ] Auth providers, SHA-1/SHA-256, Firestore rules/indexes, Functions region, and deletion callable
  are verified.
- [ ] Cross-user access denial and offline-to-online sync pass on the Play-installed build.
- [x] Firebase-disabled builds avoid native Analytics, Crashlytics, App Check, and Google Sign-In
  imports during startup.
- [x] Remote Config defaults disable ads, rewarded export, force update, and maintenance mode.
- [ ] App Check Play Integrity metrics are healthy before staged Firestore/Functions enforcement.

## AdMob and consent

- [x] Development/preview use official test IDs; production never substitutes test IDs.
- [x] Production ad request configuration contains no committed test-device identifiers.
- [ ] Production Android app/native/interstitial/rewarded unit IDs are configured.
- [ ] UMP regional messages, privacy-options reopening, Play ads declaration, and `app-ads.txt` are
  reviewed.
- [ ] First internal test starts with every Remote Config ad switch off.
- [ ] Consent rejection, no-fill, timeout, rewarded dismissal, and interstitial policy pass on device.

## Privacy, deletion, and Data Safety

- [x] Production config rejects missing, non-HTTPS, localhost, and example legal URLs.
- [x] In-app local export/delete and authenticated account/cloud deletion flows exist.
- [ ] Final privacy policy URL and public account-deletion URL are supplied and reachable.
- [ ] Public deletion page explains verification, deleted/retained data, and completion time.
- [ ] Owner/legal review completes the engineering Data Safety inventory and Play declarations.
- [ ] Controller/contact, processors, regions, retention, children/age position, ads, and user rights
  are final in policy/terms.

## Store listing

- [x] Turkish and English short/full descriptions, feature bullets, screenshot plan, and release
  notes are drafted.
- [ ] Final brand assets, phone screenshots, feature graphic, category, contact details, content
  rating, pricing, and countries are approved in Play Console.
- [ ] Listing contains no debug/test data, unsupported claims, or financial-advice implication.

## Internal device acceptance

- [ ] Install from the Play internal-test link and complete the full offline motorcycle journey.
- [ ] Restart persistence, edit/duplicate/archive/delete, scenario, comparison, PDF/share, and
  failure fallbacks pass.
- [ ] Cloud opt-in, reconnect sync, user isolation, soft-delete sync, and account deletion pass if
  Firebase ships.
- [ ] Turkish/English, light/dark/system, maximum font, TalkBack, reduced motion, and small-screen
  review pass.
- [ ] Analytics consent on/off and Crashlytics typed/redacted release events are verified.

## Release operations

- [x] Production build commands, signing boundary, smoke plan, rollback plan, and EAS Update
  suitability are documented.
- [ ] Last known-good AAB/config/rules/functions/release notes are retained by the owner.
- [ ] Internal rollout owner, monitoring window, feedback channel, stop criteria, and rollback
  decision-maker are assigned.

See [Android internal testing preparation](ANDROID_INTERNAL_TESTING.md),
[Data Safety inventory](DATA_SAFETY.md), and [Play listing draft](PLAY_STORE_LISTING.md).
