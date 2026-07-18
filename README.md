# Hidden Cost

Hidden Cost is an Android-first, iOS-compatible Expo application for estimating the total cost of
ownership of products and services. It is designed to work offline first and to explain the
assumptions behind every result.

## Current status

Phase 1 (bootstrap) establishes the Expo SDK 57, TypeScript, environment, quality, CI, and
application-initialization foundations. Calculation features, SQLite, Firebase, AdMob, and the full
product UI are intentionally not part of this phase.

## Technology

- Expo SDK 57 and React Native 0.86
- TypeScript in strict mode
- Expo Router with routes under `src/app`
- EAS Build profiles for development, preview, and production
- ESLint, Prettier, and Jest

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

## Running the bootstrap app

The Phase 1 app can run in Expo Go because Firebase, AdMob, and SQLite domain infrastructure have
not been added:

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
src/components/                  Shared presentation components
src/features/app-initialization/ Bootstrap application state
src/config/                      Validated public runtime configuration
src/domain/                      Pure domain rules (future phase)
src/data/                        Infrastructure adapters (future phase)
src/services/                    Replaceable external services (future phase)
docs/                            Product and architecture documentation
```

UI code must not call Firebase, SQLite, analytics, or advertising providers directly. See
[Architecture](docs/ARCHITECTURE.md) for dependency rules.

## Known Phase 1 limitations

- The current screens are the Expo starter UI, not the Hidden Cost product UI.
- There is no calculation engine or persistent domain data.
- Firebase, AdMob, and SQLite are not configured.
- App identifiers, EAS project ID, store credentials, and production service configuration are not
  present.

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
