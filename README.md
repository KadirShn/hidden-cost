# Hidden Cost

Hidden Cost is an Android-first, iOS-compatible Expo application for estimating the total cost of
ownership of products and services. It is designed to work offline first and to explain the
assumptions behind every result.

## Current status

Phase 7 adds optional anonymous Firebase backup, Google account linking, revision-aware queue sync,
Remote Config defaults, Emulator Suite security rules, and secure cloud-account deletion while
preserving SQLite-first behavior. Real advertising remains outside this phase.

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

The Phase 7 app initializes its versioned Expo SQLite database and built-in templates before routes
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
npm test -- --runInBand
npm run format:check
```

GitHub Actions runs install, typecheck, lint, and tests for pull requests and pushes to `main`.

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

## Known Phase 7 limitations

- Inbound cloud restore and the interactive conflict-resolution screen remain future work; a newer
  cloud revision is preserved and exposed as `conflict` instead of being overwritten.
- Real Firebase credentials are intentionally absent. Without build-time configuration the app
  remains local-only. AdMob is not configured.
- The Phase 6 export policy grants free access. A rewarded provider can replace it in Phase 8
  without changing report generation or screen code.

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
- [Privacy checklist](docs/PRIVACY_CHECKLIST.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)

## Disclaimer

Hidden Cost provides estimates based on user-entered assumptions. It does not provide financial,
legal, tax, or investment advice.

## License

MIT
