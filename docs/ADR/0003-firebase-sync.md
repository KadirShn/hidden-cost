# ADR 0003: Firebase synchronization boundary

- Status: Proposed
- Date: 2026-07-18

Firebase is accessed through infrastructure adapters. A queue-based worker synchronizes changes after successful SQLite writes.
