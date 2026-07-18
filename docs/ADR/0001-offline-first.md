# ADR 0001: Offline-first architecture

- Status: Accepted
- Date: 2026-07-18

SQLite is the primary local data source. Changes are committed locally first and added to a synchronization queue. Firestore is optional backup and multi-device synchronization.
