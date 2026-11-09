# Main Calculation Flow

## Scope

The local, end-to-end calculation flow lets a user choose a seeded template, create a draft, enter
assumptions, calculate a result, save it, reopen it, and edit or manage the project without a
network connection.

## Routes

```text
/(tabs)/home                 Dashboard and recent projects
/(tabs)/calculations         Saved, draft, and archived calculations
/templates                   Searchable template library
/templates/[id]              Template preview
/wizard/[id]                 Seven-step calculation form
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
- Upfront (step 2) and recurring (step 4) cost lines are built from the template's
  `recommendedItems`, matched to saved items by key. Lines left at 0 are not persisted (or are
  disabled when they already exist); users can add named custom lines and remove them, which
  soft-deletes the saved item. Recurring lines carry an editable payment frequency.
- Energy/fuel inputs depend on the category (`energy-profile.ts`): L/100 km for cars and
  motorcycles, L/hour for boats, and device watts for electronics (usage in hours). Each is
  converted to the engine's `consumptionPer100Units`. Subscriptions and custom projects have none.
- Drafts are stored under `wizard-draft:v2:<projectId>`; drafts with the earlier field shape are
  ignored.
- Project and cost-item domain entities are saved together in one SQLite transaction.
- A navigation guard warns while the latest draft write is pending.

## Result contract

The result screen calls the pure calculation engine. Information follows decision order: three key
metrics, a deterministic decision summary, labeled breakdown bars and top drivers, completeness and
warnings, then expandable assumptions and formulas. The summary explains dominant purchase costs,
material hidden costs, operating drivers, resale offsets, and incomplete inputs without making
financial recommendations. Every chart-like element has a text alternative; color is not the only
differentiator.

Scenario editing, comparisons, PDF, and result-card sharing are documented in
[Scenarios, comparison, and export](EXPORT_AND_COMPARISON.md). Firebase backup remains optional and
does not participate in calculation or local persistence.
