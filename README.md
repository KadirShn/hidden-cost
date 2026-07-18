# Hidden Cost

Hidden Cost is an Android-first, iOS-compatible Expo application for estimating the total cost of
ownership of products and services. It is designed to work offline first and to explain the
assumptions behind every result.

## Current status

Phase 2 establishes the design system, onboarding, four-tab navigation, Turkish/English
localization, persistent theme preferences, and reusable UI primitives. Calculation features,
domain persistence, Firebase, and AdMob remain outside this phase.

## Technology

- Expo SDK 57 and React Native 0.86
- TypeScript in strict mode
- Expo Router with routes under `src/app`
- `expo-localization`, i18next, and react-i18next
- Semantic light/dark theme tokens with a persistent system/light/dark preference
- `expo-sqlite/localStorage` for small application preferences only
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

The Phase 2 app runs in Expo Go. SQLite is used only through its localStorage polyfill for language,
theme, and onboarding preferences; no domain schema or migration exists yet:

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
src/i18n/                        Turkish/English resources
src/theme/                       Semantic tokens and theme provider
src/store/                       Small preference storage
src/utils/                       Locale-aware presentation formatters
src/config/                      Validated public runtime configuration
src/domain/                      Pure domain rules (future phase)
src/data/                        Infrastructure adapters (future phase)
src/services/                    Replaceable external services (future phase)
docs/                            Product and architecture documentation
```

UI code must not call Firebase, SQLite, analytics, or advertising providers directly. See
[Architecture](docs/ARCHITECTURE.md) for dependency rules.

## Navigation

- Onboarding: welcome, local-data/privacy summary, language and theme preferences
- Tabs: Home, Calculations, Compare, Settings
- Each tab owns a nested Stack so titles and future detail routes have independent histories.

## Known Phase 2 limitations

- There is no calculation engine or persistent domain data.
- Home, calculations, and comparison screens are data-independent shells.
- Firebase and AdMob are not configured.
- The SQLite domain schema is intentionally deferred to Phase 4.

## Documentation

- [Product specification](docs/HIDDEN_COST_PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Codex master prompt](docs/HIDDEN_COST_CODEX_MASTER_PROMPT.md)
- [Calculation engine](docs/CALCULATION_ENGINE.md)
- [Firebase setup](docs/FIREBASE_SETUP.md)
- [AdMob setup](docs/ADMOB_SETUP.md)
- [Privacy checklist](docs/PRIVACY_CHECKLIST.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)

## Disclaimer

Hidden Cost provides estimates based on user-entered assumptions. It does not provide financial,
legal, tax, or investment advice.

## License

MIT
