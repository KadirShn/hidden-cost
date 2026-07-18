# Architecture

## Goals

- Reliable offline operation
- Testable calculation rules
- Clear separation between UI, domain and infrastructure
- Safe monetary calculations
- Optional Firebase synchronization
- Replaceable analytics and advertising providers

## Dependency direction

```text
UI / Routes
    ↓
Feature application logic
    ↓
Domain interfaces and rules
    ↓
Infrastructure adapters
```

The domain layer must not import React, Expo, Firebase, SQLite or advertising packages.

## Local-first data flow

1. User changes a project.
2. The repository validates and writes the change to SQLite.
3. A synchronization queue operation is created.
4. The UI renders from local data.
5. The worker sends queued operations to Firestore when possible.
6. Failed operations are retried with bounded exponential backoff.

## Money representation

Persist ISO currency codes and integer minor-unit values. Use decimal arithmetic in the calculation engine and locale-aware formatting only in the presentation layer.

## Advertising boundary

Screens do not load or show ads directly. An AdsPolicyService decides consent, placement, frequency and cooldown. Ad failures never block the base application.
