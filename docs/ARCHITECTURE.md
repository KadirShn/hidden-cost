# Architecture

## Status and scope

This document records the Phase 3 architecture baseline. The repository contains the application
shell plus a pure, versioned, validated calculation domain. Domain persistence, synchronization,
analytics, and advertising integrations remain explicitly outside this phase.

## Goals

- Reliable offline operation once persistence is introduced
- Pure, testable calculation rules
- Clear separation between presentation, application, domain, and infrastructure
- Safe monetary calculations using minor units and decimal arithmetic in the domain phase
- Optional, replaceable Firebase synchronization
- Replaceable analytics and advertising providers

## Dependency direction

```text
Routes and UI
    ↓
Feature application logic
    ↓
Domain interfaces and rules
    ↓
Infrastructure adapters
```

Dependencies point inward. Domain code must not import React, Expo, Firebase, SQLite, analytics, or
advertising packages. Routes must not contain reusable components or infrastructure calls.

## Phase 3 directory boundaries

```text
src/
  app/                         Expo Router route and layout modules only
    (onboarding)/              Three-step onboarding stack
    (tabs)/                    Four native tabs with nested stacks
  components/                  Shared presentation components
    feedback/                  Initialization and fatal-error states
    layout/                    Responsive screen and stack helpers
    ui/                        Provider-independent UI primitives
  config/                      Validated public runtime configuration
  features/
    app-initialization/        Bootstrap state and initialization boundary
    onboarding/                Onboarding presentation composition
    settings/                  Persistent settings context
  i18n/                        Turkish and English resource dictionaries
  store/                       Small key-value settings storage
  theme/                       Semantic tokens and theme provider
  utils/                       Locale-aware presentation formatting
  domain/                      Pure money, schemas, calculation, scenarios, and comparison
  data/                        Repository implementations in later phases
  services/                    Replaceable provider adapters in later phases
```

The Phase 2 screens remain product-aware shells and intentionally do not call the Phase 3 engine
yet. That application-layer wiring belongs to a later user-flow phase.

## Navigation

The root Stack owns the initial redirect, onboarding group, and tab group. The tab group defines
four static native destinations: Home, Calculations, Compare, and Settings. Each tab is a directory
with its own nested Stack, preserving independent navigation history and native headers.

Onboarding completion is a persisted boolean preference. Until it is set, the root index redirects
to the welcome screen; completion replaces the route with Home.

## Theme and localization

The theme layer exposes semantic tokens rather than component-specific colors. It supports
`system`, `light`, and `dark` preferences while resolving one active theme for both application UI
and Expo Router's navigation theme.

Turkish and English strings live in separate i18next resources. Components accept translated labels
from their callers and do not own screen copy. Locale-aware number and currency formatting remains a
presentation concern. Localized money input is converted to canonical minor units before it reaches
the `Money` value object.

## Preference persistence

Language, theme, and onboarding state use the synchronous `expo-sqlite/localStorage` polyfill. This
is intentionally not the Phase 4 domain database: it has no tables, migrations, repositories, seed
data, or project entities. Phase 4 will introduce those behind the data boundary.

## UI primitives

The UI layer includes Button, IconButton, TextField, MoneyInput, NumberInput, SelectField, Card,
MetricCard, Chip, Divider, EmptyState, ErrorState, OfflineBanner, LoadingSkeleton, ConfirmDialog, and
StepIndicator. Primitives enforce minimum touch targets, semantic accessibility roles, scalable
text, and theme tokens. Loading animation observes the operating system's reduced-motion setting.

## Application initialization

The root Expo Router layout owns two independent failure paths:

1. `AppInitializationGate` validates and initializes runtime dependencies before routes render.
2. Expo Router's root `ErrorBoundary` catches render failures and presents a safe retry action.

The user-facing fallback does not display stack traces, exception messages, credentials, or user
data. Future initialization tasks such as migrations must be added behind the feature boundary and
must fail without deleting local data.

## Environment configuration

`EXPO_PUBLIC_APP_ENV` is the only Phase 1 public environment value. Both `app.config.ts` and the
runtime config layer accept exactly `development`, `preview`, or `production`. Unknown values fail
early instead of silently selecting a production-like configuration.

Expo public variables are bundled into the client and are never a secret store. Firebase and AdMob
configuration is intentionally deferred to their designated phases.

## Build profiles

`eas.json` provides three profiles:

- Development: internal distribution with a development client
- Preview: internal distribution
- Production: production environment with automatic build-number increment

The repository does not define real application identifiers, an EAS project ID, signing
credentials, or store credentials.

## Local-first data flow (future Phase 4+)

1. The user changes a project.
2. A repository validates and writes the change to SQLite in a transaction.
3. A synchronization queue operation is created.
4. The UI renders from local data.
5. A worker sends queued operations to Firestore when allowed and available.
6. Failed operations use bounded exponential backoff.

SQLite will remain the primary source of truth; Firestore will be optional backup and
synchronization infrastructure.

## Money representation and calculation domain

Money carries an ISO 4217 code and an arbitrary-precision Decimal minor-unit value. Persisted inputs
and serialized outputs are integer minor-unit strings, avoiding JavaScript safe-integer limits.
Fractional intermediate minor units are rounded once with half-up semantics at output boundaries.

Zod schemas validate projects, items, financing, residual value, assumptions, scenarios, inputs,
and results. The engine is a deterministic pure function. It calculates initial, recurring, usage,
fuel/energy, financing, residual, TCO, derived metrics, breakdown, completeness, and warnings.
Financing principal and down payment are not added to TCO because purchase price already includes
them. See [Calculation Engine](CALCULATION_ENGINE.md) for the complete formula contract.

## Advertising boundary (future Phase 8)

Screens will not load or show ads directly. A policy service will decide consent, placement,
frequency, and cooldown. Ad failures must never block the base application.

## Quality gates

The local and CI quality gates are:

- TypeScript strict typecheck
- ESLint with zero warnings
- Jest tests
- Deterministic install through `package-lock.json` and `npm ci`

Format checking is available separately through `npm run format:check`.
