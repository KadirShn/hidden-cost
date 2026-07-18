# Architecture

## Status and scope

This document records the Phase 1 architecture baseline. The repository contains the application
bootstrap only; calculation, persistence, synchronization, analytics, and advertising integrations
remain explicitly outside this phase.

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

## Phase 1 directory boundaries

```text
src/
  app/                         Expo Router route and layout modules only
  components/                  Shared presentation and feedback components
    feedback/                  Initialization and fatal-error states
  config/                      Validated public runtime configuration
  features/
    app-initialization/        Bootstrap state and initialization boundary
  domain/                      Pure business rules in later phases
  data/                        Repository implementations in later phases
  services/                    Replaceable provider adapters in later phases
```

The existing Expo starter screens remain in place until the design-system and navigation phase.
They do not establish product-domain behavior.

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

## Money representation (future Phase 3+)

Persist ISO 4217 currency codes and integer minor-unit values. Use decimal arithmetic in the pure
calculation engine and locale-aware formatting only in the presentation layer. Financing principal
must never be counted twice in total cost of ownership.

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
