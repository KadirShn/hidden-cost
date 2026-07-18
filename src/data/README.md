# Data boundary

SQLite is the primary source of truth. Expo SQLite is opened only by `database/client.ts`; routes
and UI consume repository interfaces through `RepositoryProvider` and TanStack Query hooks.

Every project, cost-item, profile, and scenario mutation writes its latest sync intent in the same
Drizzle transaction. Deletes are soft deletes. Migrations and template seed data run before the app
leaves its initialization gate. Firebase and queue processing remain future adapters.
