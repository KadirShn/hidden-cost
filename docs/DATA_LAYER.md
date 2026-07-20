# Offline-first data layer

## Runtime flow

1. Application initialization opens `hidden-cost.db` with Expo SQLite.
2. WAL and foreign-key enforcement are enabled.
3. The custom versioned migration runner verifies `schema_migrations` and applies pending SQL inside
   transactions.
4. Six built-in template records are inserted idempotently.
5. Repository services become available to the application.
6. UI code reads and mutates through TanStack Query hooks; it never imports SQLite or Drizzle.
7. After explicit cloud opt-in, a Firebase adapter processes ready synchronization intents.

The database is the local source of truth. Query caching is configured with `networkMode: always`,
so local reads and mutations are not paused in airplane mode. Firebase never replaces SQLite as the
primary source. Without Firebase configuration or network access, queue records remain local and
calculation behavior is unchanged.
Metro treats SQLite's WASM module as an asset for web bundles. A deployed web host must additionally
provide Expo SQLite's required COOP/COEP headers; native Android/iOS storage does not require them.

## Schema

The initial schema is version 1 and contains:

- `user_profile`
- `projects`
- `cost_items`
- `scenario_overrides`
- `template_cache`
- `sync_queue`
- `app_settings`
- `schema_migrations`

Project money values remain integer minor-unit strings. Structured financing, residual value, and
assumption data are JSON columns validated by the Phase 3 Zod schemas at repository boundaries.
Projects, items, and scenario overrides include `updated_at`, `revision`, and `device_id` metadata
for later last-write-wins/conflict handling.

## Migrations

Migration definitions live in `src/data/database/migrations.ts`. Each has an immutable integer
version, name, checksum, and static SQL body. The runner:

- bootstraps only the migration ledger;
- rejects a changed name or checksum for an applied version;
- applies each pending migration in its own transaction;
- records the version only after all SQL succeeds;
- never deletes or recreates the database after failure.

A failed migration rolls back that migration while preserving previously committed schema and user
data. Future schema changes must add a new migration rather than editing version 1. `drizzle-kit`
and `npm run db:generate` are available to inspect/generate SQL from the Drizzle schema, but checked-in
application migrations remain explicit so they can use the required `schema_migrations` ledger.

## Repository and transaction rules

Repository interfaces cover projects, scenario overrides, profiles, templates, app settings, and
the sync queue. The project adapter supports create/read/update, draft autosave, cost-item upsert,
duplicate, archive, item/project soft delete, and bundle reads.

Entity changes and sync queue intent are written in the same transaction. The queue has one pending
record per entity; repeated autosaves replace its payload with the latest revision instead of
creating an unbounded backlog. Delete intent replaces a pending upsert. Queue payloads include the
entity revision and device ID. The opt-in worker sends these intents through a platform Firebase
adapter only after auth and network checks.

Soft-deleted rows keep `deleted_at` and remain available for synchronization. Default repository
queries exclude them. Successful sync atomically removes the queue record and marks the entity
`synced`. Failures mark it `failed` and schedule bounded exponential retry. A newer cloud revision
marks it `conflict` and blocks automatic overwrite. Firestore receives soft-delete tombstones;
explicit account deletion removes the authenticated user's known document tree in bounded client
batches protected by owner-only Firestore rules, then deletes the Auth user. This keeps deletion
available on Firebase's Spark plan.

## Template seed

Automobile, motorcycle, boat, electronics, subscription, and custom templates are versioned data,
not a domain enum. Seed insertion uses the `(template_id, version)` primary key and conflict-ignore,
making repeated startup safe while preserving a future remotely cached record with the same key.

## Development reset

Database reset is unavailable unless both the build and runtime environment are development. It is
shown under Settings only in that environment, requires a destructive confirmation dialog and an
exact internal confirmation token, closes the connection, deletes only `hidden-cost.db`, recreates
the schema/seed, clears the Query cache, and reloads the development app. Migration failure never
triggers reset automatically.

## Tests

Migration and repository tests use a real `better-sqlite3` database with the same Drizzle schema.
They cover migration idempotency, checksum integrity, rollback/data preservation, file reopen
persistence, autosave merging, duplicate/archive, soft delete, sync queue coalescing, atomic
rollback, and idempotent six-template seed behavior.
