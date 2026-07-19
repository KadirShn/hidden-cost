# Quality and release verification

## Scope

Phase 10 adds automated and manual release gates without changing the calculation contract or the
SQLite-first source of truth. Tests never require real Firebase credentials or live advertising.

## Accessibility

- Shared inputs expose labels, hints, error state, and assertive live-region errors. Invalid wizard
  navigation announces a localized correction message.
- Wizard step changes and dialogs move screen-reader focus to their heading.
- Buttons and chips grow vertically with font scale; fatal and modal content can scroll.
- Skeleton/dialog transitions observe the operating-system reduced-motion preference.
- Result and comparison charts pair every color with a visible name and exact formatted value.
- Virtualized rows provide grouped, descriptive accessibility labels instead of relying on visual
  arrangement.

Before store submission, run the complete onboarding, motorcycle calculation, result, comparison,
settings, privacy, and delete/export flows on the smallest supported Android screen at maximum font
size. Repeat with TalkBack and Switch Access. Automated semantics tests are not a substitute for
this physical-device review.

## Performance diagnostics

`PerformanceMonitor` records startup marks/durations and React render durations in a bounded
50-entry in-memory buffer. Development Settings shows the latest samples. No sample is persisted or
sent to Analytics. Project and template collections use `FlatList` with bounded initial/batch/window
values; changes to these values require profiler evidence on a low-end target device.

Capture cold and warm startup from a preview release APK. Development-client timings include debug
tooling and are not release budgets. Record device model, Android version, project count, and sample
size when establishing a release threshold.

## Automated gates

```bash
npm ci
npx expo install --check
npm run typecheck
npm run lint
npm run format:check
npm run test:ci
npm ci --prefix functions
npm run build --prefix functions
npm run lint --prefix functions
```

Firestore rules require Java 21 and use the local emulator only:

```bash
npm run test:rules
```

The rules suite verifies authentication, owner isolation, revision constraints, and delete
tombstones. CI provisions Java 21 explicitly.

## Android release and offline E2E

The preview build uses only official AdMob test IDs and keeps Firebase disabled when service files
are absent:

```powershell
$env:EXPO_PUBLIC_APP_ENV='preview'
$env:NODE_ENV='production'
npx expo prebuild --platform android --clean --no-install
Set-Location android
.\gradlew.bat --no-daemon :app:assembleRelease
```

Install `android/app/build/outputs/apk/release/app-release.apk` on an Android emulator/device, then
run:

```bash
npm run test:maestro
```

`.maestro/offline-main-flow.yaml` completes onboarding, enables airplane mode, selects the
motorcycle template, calculates and saves a project, and opens its detail. Airplane mode is restored
at the end. The flow is Android-only because Maestro airplane-mode control is Android-only.

## Failure-injection coverage

- Sync network outages preserve pending work and process at most the configured batch size.
- Simultaneous foreground/network triggers coalesce into one worker run.
- Ad consent errors fail closed; rewarded/interstitial load failures return safe unavailable
  outcomes and never block calculation/export fallback.
- The offline integration test creates, calculates, saves, closes, and reopens SQLite data without
  initializing Firebase.

## Known limitations and manual gates

- Real Firebase/AdMob configuration, App Check enforcement, production UMP messages, signing, and
  store-console declarations are owner/operator tasks; credentials are intentionally absent.
- Inbound cloud restore and interactive conflict resolution are not implemented. Conflicting newer
  cloud revisions remain visible instead of being overwritten.
- A signed production AAB and store launch cannot be validated without production identifiers and
  signing credentials. The automated build is an unsigned/internal preview release APK.
- TalkBack, Switch Access, maximum-font visual inspection, PDF/share intent behavior, and long-run
  memory/startup profiling remain required on final target hardware.
- The current Expo SDK 57 toolchain transitively includes `uuid` through Expo config/xcode tooling;
  npm reports its buffer-check advisory as moderate with no upstream fix. It is build tooling, not
  application-domain input handling, but must be re-audited on each Expo patch upgrade.
- The first local Maestro runs exposed credentials-free App Check and Google Sign-In imports at
  startup. Platform autolinking exclusions plus local-only import guards now fail closed; the rebuilt
  preview release APK remained foreground without a fatal exception and passed the complete offline
  Maestro journey.
