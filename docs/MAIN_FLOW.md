# Main Calculation Flow

## Scope

Phase 5 delivers the local, end-to-end calculation flow. A user can choose a seeded template,
create a draft, enter assumptions, calculate a result, save it, reopen it, and edit or manage the
project without a network connection.

## Routes

```text
/(tabs)/home                 Dashboard and recent projects
/(tabs)/calculations         Saved, draft, and archived calculations
/templates                   Searchable template library
/templates/[id]              Template preview
/wizard/[id]                 Eight-step calculation form
/result/[id]                 Calculated result and save action
/project/[id]                Saved project result and actions
```

Route modules contain only route composition or feature exports. Screen behavior lives under
`src/features`.

## Form and persistence

- React Hook Form owns localized string values while the wizard is open.
- Zod validates the current step before forward navigation and the complete form before calculate.
- `MoneyInput` accepts the active locale and formats a valid amount when focus leaves the field.
- Money is normalized to integer minor-unit strings before entering the domain or repository.
- A 600 ms debounced raw-form snapshot is saved through `AppSettingsRepository`.
- Pending input is flushed when the app backgrounds, a step advances, or the wizard unmounts.
- Project and cost-item domain entities are saved together in one SQLite transaction.
- A navigation guard warns while the latest draft write is pending.

## Result contract

The result screen calls the pure Phase 3 engine. It presents total and monthly cost, usage-unit
cost, data completeness, labeled breakdown bars, top drivers, warnings, and an expandable formula
summary. Every chart-like element has a text alternative; color is not the only differentiator.

The reserved advertising container is inert and hidden from accessibility. No advertising SDK or
credential is included.

## Deferred work

Low/base/high scenario editing, comparisons, PDF, sharing, Firebase synchronization, analytics,
consent, and real advertising stay in their designated later phases.
