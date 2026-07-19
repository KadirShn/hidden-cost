# Architecture

## Status and scope

This document records the Phase 9 architecture baseline. The application connects its Expo
Router screens to the pure calculation domain through an offline-first repository layer. Remote
Firebase backup/synchronization is optional and adapter-bound. Advertising is isolated behind a
consent-aware adapter and policy service; safe defaults keep every format disabled.

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

## Phase 9 directory boundaries

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
    calculation-wizard/        RHF form, Zod steps, autosave, domain mapping
    dashboard/                 Dashboard Query composition
    templates/                 Template library and detail
    projects/                  Saved list, detail, and lifecycle actions
    results/                   Accessible calculation result presentation
    scenarios/                 Sparse override editor and sensitivity summary
    comparison/                Two-to-three project decision support
    export/                    Export action presentation
    cloud-backup/              Opt-in auth, sync state, and Settings UI
  i18n/                        Turkish and English resource dictionaries
  store/                       Small key-value settings storage
  theme/                       Semantic tokens and theme provider
  utils/                       Locale-aware presentation formatting
  domain/                      Pure money, schemas, calculation, scenarios, and comparison
  data/                        Database, migrations, repositories, templates, and query hooks
  services/
    export/                    HTML reports, native adapter, and access policy
    firebase/                  Platform client, queue worker, backoff, defaults
```

Feature screens consume TanStack Query hooks and repository interfaces. Routes remain thin exports,
and the domain remains unaware of React, Expo, Query, or SQLite.

## Navigation

The root Stack owns the initial redirect, onboarding group, and tab group. The tab group defines
four static native destinations: Home, Calculations, Compare, and Settings. Each tab is a directory
with its own nested Stack, preserving independent navigation history and native headers.

A root `(flow)` Stack owns template library/detail, wizard, result, and project detail routes. This
keeps focused tasks outside the tab route files while preserving platform back behavior and direct
dynamic project links.

The same flow Stack owns `/scenario/[id]`. Comparison remains the content of its native tab and
loads selected project bundles through Query keys rather than direct repository or SQL access.

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

The calculation wizard keeps localized strings in React Hook Form, validates each of eight steps
with locale-aware Zod schemas, and maps only normalized values into the domain. A debounced raw form
snapshot is stored through `AppSettingsRepository`; it is flushed on backgrounding and navigation.
Final project and cost-item updates use one repository transaction.

## Preference persistence

Language, theme, and onboarding state continue using the synchronous `expo-sqlite/localStorage`
polyfill. Project data uses the separate versioned `hidden-cost.db`; the `app_settings` table is
available for database-scoped settings without coupling presentation code to SQL.

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
data. Database migrations and template seed now run behind this boundary and fail without deleting
local data.

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

## Local-first data flow

1. The user changes a project.
2. A repository validates and writes the change to SQLite in a transaction.
3. A synchronization queue operation is created in the same transaction.
4. The UI renders from local data.
5. A worker sends queued operations to Firestore when allowed and available.
6. Failed operations use bounded exponential backoff.

SQLite is the primary source of truth; Firestore is an optional backup adapter. Repositories create
queue intents transactionally. The worker runs only after opt-in and auth, uses idempotent
revision-aware transactions, synchronizes soft-delete tombstones, and never blocks local writes.
Routes and UI depend on repository/service contexts, never Firestore or SQL.
See [Offline-first data layer](DATA_LAYER.md) for schema and migration rules.

## Money representation and calculation domain

Money carries an ISO 4217 code and an arbitrary-precision Decimal minor-unit value. Persisted inputs
and serialized outputs are integer minor-unit strings, avoiding JavaScript safe-integer limits.
Fractional intermediate minor units are rounded once with half-up semantics at output boundaries.

Zod schemas validate projects, items, financing, residual value, assumptions, scenarios, inputs,
and results. The engine is a deterministic pure function. It calculates initial, recurring, usage,
fuel/energy, financing, residual, TCO, derived metrics, breakdown, completeness, and warnings.
Financing principal and down payment are not added to TCO because purchase price already includes
them. See [Calculation Engine](CALCULATION_ENGINE.md) for the complete formula contract.

## Advertising boundary

`AdsPolicyService` decides the Remote Config kill switch, current UMP permission, placement,
first-session exclusion, completed-calculation threshold, and cooldown. The Google SDK is confined
to platform adapters/components; web and unsupported builds receive no-op implementations.

Native inventory is allowed only after meaningful dashboard/template content exists. Rewarded
inventory requires an export-specific user opt-in and fails open to free export on no-fill/load
failure. Interstitial checks occur only after a result is persisted and project detail is visible;
they never run in onboarding, the first session, or the wizard.

Ad event analytics has a separate default-off user permission. Its typed payload permits format,
placement, event, and bounded SDK error only. Domain inputs, project metadata, currency, and cost
results cannot enter the event contract. Ad failures must never block the base application.

## Observability and privacy boundary

All product telemetry passes through `TelemetryService`. Event names match the Product Spec
allowlist and parameters are reduced at runtime to categorical step, bucket, locale, offline, and
source fields. Firebase Analytics collection defaults off and follows a versioned Settings consent.
Ad event adapters map only approved impression/reward lifecycle events into this same boundary.

Crashlytics native auto-collection is disabled in config. The adapter enables it only for production
and records typed error codes plus redacted, allowlisted attributes; it never records raw domain
input or user text. Development test actions are reachable only from the development tools section.

App Check selects debug providers for development/preview and Play Integrity for Android production.
It initializes before Firestore mutation and callable account deletion. Console enforcement remains
an operator rollout after valid-request metrics are reviewed. Local data export/delete is isolated in
a repository that snapshots or deletes user-owned tables transactionally without exposing SQL to UI.

## Quality gates

The local and CI quality gates are:

- TypeScript strict typecheck
- ESLint with zero warnings
- Jest tests
- Deterministic install through `package-lock.json` and `npm ci`

Format checking is available separately through `npm run format:check`.
