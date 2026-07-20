# Privacy Checklist

Complete this checklist for every production release.

## Analytics and crash reporting

- [x] Analytics collection defaults to off and can be changed from Settings.
- [x] Consent is versioned locally and disabling it stops Firebase Analytics collection.
- [x] Only the Product Spec event-name allowlist is exposed by the central adapter.
- [x] Event parameters are limited to step/bucket/locale/offline/source categorical fields.
- [x] Automated tests reject cost amounts, financing amounts, titles, notes, email, and free text.
- [x] Crashlytics automatic collection is disabled in native config and enabled only in production.
- [x] Crash context uses typed error codes and redacted, allowlisted attributes.
- [x] Analytics and non-fatal test actions exist only in the development tools UI.
- [ ] Firebase Analytics DebugView and Crashlytics symbol/source-map processing are verified on a
      release candidate.

## Advertising privacy

- [x] UMP is refreshed before Mobile Ads initialization.
- [x] Ads are not requested while UMP reports `canRequestAds=false`.
- [x] Advertising privacy options can be reopened from Settings when required.
- [x] Advertising and analytics consent are separate controls.
- [ ] Published AdMob privacy messages and store disclosures are reviewed for every target region.

## User data controls

- [x] Local calculations, profile, settings, and sync records can be exported as JSON.
- [x] Temporary export files are removed after the share attempt.
- [x] Local user data can be permanently deleted with explicit confirmation and a transaction.
- [x] Authenticated account deletion recursively deletes the caller's cloud path and Auth account.
- [x] Local and cloud deletion are separate and their confirmation text explains the boundary.
- [x] Firestore ownership rules and cloud deletion paths ignore client-supplied UIDs.

## App Check and abuse protection

- [x] Development/preview use the debug provider; production Android uses Play Integrity.
- [x] No debug App Check token exists in source, Expo public config, or production configuration.
- [x] App Check initialization precedes Firestore sync and cloud account deletion.
- [x] Enforcement rollout and rollback are documented before enforcement is enabled.
- [ ] Production signing SHA-256 fingerprints and Play App Signing are registered.
- [ ] Valid/missing/invalid metrics are observed before enforcing Functions or Firestore.

## Legal and release review

- [x] Privacy, terms, and disclaimer screens are reachable from Settings.
- [x] In-app legal copy is explicitly marked as draft pending legal/privacy review.
- [ ] Final privacy policy, terms, controller/contact details, retention periods, and policy URL are
      approved by qualified reviewers before release.
- [ ] Google Play Data safety and Apple App Privacy disclosures match the actual enabled services.
