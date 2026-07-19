# Hidden Cost

Hidden Cost is an Android-first, iOS-compatible Expo application for estimating the total cost of
ownership of products and services. It is designed to work offline first and to explain the
assumptions behind every result.

## Current status

Phase 11 prepares the Android internal-testing release boundary: an AAB production profile, remote
versioning, signing/credential guidance, production Firebase/AdMob/App Check/Remote Config gates,
Data Safety inventory, Play listing copy, smoke/rollback plans, and explicit owner-supplied inputs.
No store submission or credential mutation is automated.

## Technology

- Expo SDK 57 and React Native 0.86
- TypeScript in strict mode
- Expo Router with routes under `src/app`
- `expo-localization`, i18next, and react-i18next
- Semantic light/dark theme tokens with a persistent system/light/dark preference
- `expo-sqlite/localStorage` for small application preferences only
- `decimal.js` and Zod for pure domain arithmetic and validation
- Expo SQLite, Drizzle ORM, and TanStack Query for offline-first local data
- React Hook Form and Zod for localized, step-based calculation forms
- `expo-print`, `expo-sharing`, and `expo-file-system` for guarded export and cleanup
- React Native Firebase with Expo development builds for opt-in Auth, Firestore, Functions, and
  Remote Config
- `react-native-google-mobile-ads` with UMP consent and test-only non-production inventory
- React Native Firebase Analytics, Crashlytics, and App Check behind central adapters
- EAS Build profiles for development, preview, and production
- ESLint, Prettier, Jest, and React Native Testing Library

## Requirements

- Node.js 22.13 or newer within the Expo SDK 57 supported Node 22 line
- npm 10
- Android Studio or Xcode only when running the corresponding native simulator/build

## Installation

```bash
npm ci
```

Copy `.env.example` to `.env.local` and choose one supported environment:

```text
EXPO_PUBLIC_APP_ENV=development
```

Allowed values are `development`, `preview`, and `production`. Public Expo variables are embedded
in the client bundle and must never contain secrets.

## Running the app

The app initializes its versioned Expo SQLite database and built-in templates before routes
render. Local project operations require no account or network connection:

```bash
npm start
```

For the installed development-client workflow:

```bash
npx eas-cli build --profile development --platform android
npm run start:dev-client
```

An Expo account, EAS project link, and real Android/iOS identifiers are deliberately not invented
in this repository. Supply those values when preparing an actual remote build.

## Build environments

`app.config.ts` validates `EXPO_PUBLIC_APP_ENV` and exposes the selected value through Expo config.
`eas.json` sets it explicitly for each profile:

- `development`: internal development client
- `preview`: internal preview build
- `production`: production build with automatic build-number increment

## Quality commands

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test:ci
npm run test:rules       # Java 21 required
npm run test:maestro     # Android emulator/device and Maestro required
```

GitHub Actions runs deterministic install and Expo dependency checks, typecheck, lint, formatting,
Jest, Functions checks, Firestore rules tests, a preview release APK build, and the offline Maestro
smoke journey for pull requests and pushes to `main`.

## Architecture

```text
src/app/                         Expo Router routes and layouts
src/components/ui/               Shared UI primitives
src/components/layout/           Responsive route layout helpers
src/features/app-initialization/ Bootstrap application state
src/features/onboarding/         Onboarding presentation shell
src/features/settings/           Persistent settings context
src/features/calculation-wizard/ Step validation, mapping, and draft persistence
src/features/dashboard/          Local-first dashboard composition
src/features/projects/           Saved calculation list and project actions
src/features/results/            Accessible result visualization
src/features/templates/          Template library and detail flow
src/i18n/                        Turkish/English resources
src/theme/                       Semantic tokens and theme provider
src/store/                       Small preference storage
src/utils/                       Locale-aware presentation formatters
src/config/                      Validated public runtime configuration
src/domain/                      Pure money, validation, calculation, scenario, and comparison rules
src/data/                        SQLite, migrations, repositories, seeds, and Query hooks
src/services/export/             PDF/share adapters and export access policy
src/services/firebase/           Optional native Firebase adapter and sync worker
src/services/performance/        Bounded, local-only startup and render measurements
docs/                            Product and architecture documentation
```

UI code must not call Firebase, SQLite, analytics, or advertising providers directly. See
[Architecture](docs/ARCHITECTURE.md) for dependency rules.

## Navigation

- Onboarding: welcome, local-data/privacy summary, language and theme preferences
- Tabs: Home, Calculations, Compare, Settings
- Flow stack: templates, template detail, wizard, result, and project detail
- Scenario editor: sparse low/high overrides for a project
- Each tab owns a nested Stack; focused calculation routes use a shared root flow Stack.

## Known limitations

- Inbound cloud restore and the interactive conflict-resolution screen remain future work; a newer
  cloud revision is preserved and exposed as `conflict` instead of being overwritten.
- Real Firebase credentials and production AdMob identifiers are intentionally absent. Without
  build-time configuration the app remains local-only and all advertising defaults to disabled.
- Store console declarations, production UMP messages, and Remote Config rollout remain operator
  steps documented in the setup and policy checklist.
- The automated accessibility coverage verifies semantics and scalable layouts, but TalkBack,
  Switch Access, and maximum-font visual review on the final signed build remain a physical-device
  release gate.
- Phase 10 verifies an unsigned preview release APK. A signed production AAB cannot be produced
  until the owner supplies application/store identifiers, AdMob IDs, Firebase files, and signing
  credentials.
- Performance samples are intentionally local development diagnostics, not telemetry or fixed
  cross-device budgets. Final startup/list baselines must be captured on the target low-end Android
  device.
- npm currently reports a moderate, no-fix `uuid` advisory in Expo's transitive config/xcode build
  tooling. It is tracked in the quality guide and must be reassessed on Expo SDK updates.

## Documentation

- [Product specification](docs/HIDDEN_COST_PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Codex master prompt](docs/HIDDEN_COST_CODEX_MASTER_PROMPT.md)
- [Calculation engine](docs/CALCULATION_ENGINE.md)
- [Offline-first data layer](docs/DATA_LAYER.md)
- [Main calculation flow](docs/MAIN_FLOW.md)
- [Scenarios, comparison, and export](docs/EXPORT_AND_COMPARISON.md)
- [Firebase setup](docs/FIREBASE_SETUP.md)
- [AdMob setup](docs/ADMOB_SETUP.md)
- [Advertising policy checklist](docs/AD_POLICY_CHECKLIST.md)
- [App Check setup](docs/APP_CHECK_SETUP.md)
- [Privacy checklist](docs/PRIVACY_CHECKLIST.md)
- [Quality and release verification](docs/QUALITY_AND_RELEASE.md)
- [Android internal testing preparation](docs/ANDROID_INTERNAL_TESTING.md)
- [Google Play Data Safety inventory](docs/DATA_SAFETY.md)
- [Google Play listing draft](docs/PLAY_STORE_LISTING.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)

## Disclaimer

Hidden Cost provides estimates based on user-entered assumptions. It does not provide financial,
legal, tax, or investment advice.

## License

MIT
