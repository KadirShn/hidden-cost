# Hidden Cost

Hidden Cost is an offline-first mobile decision-support application that calculates the real total cost of ownership of products and services—not just their purchase price.

## Project status

🚧 Active development — initial architecture and product planning.

## Planned MVP

- React Native + Expo + TypeScript
- Expo Router
- Offline-first SQLite
- Firebase authentication and optional cloud backup
- Car, motorcycle, boat, electronics, subscription and custom templates
- Low/base/high scenarios
- Comparison of up to three projects
- PDF and shareable result exports
- Turkish and English
- Light and dark themes
- Privacy-aware AdMob monetization

## Architecture

```text
app/                  Expo Router routes
src/
  components/         Shared UI
  features/           Product features
  domain/             Pure business rules and calculations
  data/               SQLite, Firebase, repositories and migrations
  services/           Analytics, ads, crash reporting and export
  theme/              Design tokens
  i18n/               Localization
docs/                 Product and technical documentation
```

Important boundaries:

- UI does not call Firebase, SQLite or AdMob directly.
- The calculation engine has no React, Expo or Firebase dependencies.
- SQLite is the primary local data source.
- Firebase is an optional synchronization and backup layer.
- Monetary calculations avoid native floating-point accumulation.

See [Product Specification](docs/PRODUCT_SPEC.md) and [Architecture](docs/ARCHITECTURE.md).

## Getting started

```bash
npm install
npx expo start
```

After native Firebase and AdMob modules are added, use an Expo development build rather than Expo Go.

## Quality commands

```bash
npm run typecheck
npm run lint
npm test
```

## Documentation

- [Product specification](docs/PRODUCT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Calculation engine](docs/CALCULATION_ENGINE.md)
- [Firebase setup](docs/FIREBASE_SETUP.md)
- [AdMob setup](docs/ADMOB_SETUP.md)
- [Privacy checklist](docs/PRIVACY_CHECKLIST.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Codex master prompt](docs/CODEX_MASTER_PROMPT.md)

## Disclaimer

Hidden Cost provides estimates based on user-entered assumptions. It does not provide financial, legal, tax or investment advice.

## License

MIT.
