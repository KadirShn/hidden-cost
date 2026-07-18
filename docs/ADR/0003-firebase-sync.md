# ADR 0003: Firebase synchronization boundary

- Status: Accepted
- Date: 2026-07-18

Firebase is accessed through infrastructure adapters. A queue-based worker synchronizes changes after successful SQLite writes.

SQLite remains the only UI-facing source of truth. Cloud backup is opt-in and authenticated with an
anonymous account that can be linked to Google without changing its UID. Firestore paths are scoped
under `users/{uid}` and protected by tested rules.

Outbound writes use Firestore transactions and compare revision followed by `updatedAt`. Equal
writes are idempotent, a newer local revision applies, and a newer remote revision becomes an
explicit local `conflict` instead of being overwritten. Deletes are revisioned tombstones. Retry is
bounded exponential backoff. A future ADR may add inbound merge and user-driven conflict resolution
without changing repository/UI boundaries.
