# Scenarios, Comparison, and Export

## Scenario model

Low and high scenarios store only values that override the base project. The editor supports
monthly usage, maintenance, fuel unit price, fixed resale value, and financing interest when those
fields exist on the project. Replacing one scenario is transactional: stale paths are soft-deleted
and matching sync queue intents are written in the same transaction.

The analysis calculates low, base, and high results with the pure calculation engine. It reports
the minimum, maximum, spread, and the override with the largest isolated absolute TCO impact. It is
a deterministic sensitivity summary, not a Monte Carlo simulation.

## Comparison rules

- Two or three completed projects can be selected.
- Raw totals and monthly equivalents remain separate metrics.
- A user-selected common ownership period multiplies each monthly equivalent; saved data is not
  changed.
- Different currencies produce a warning and disable rankings and common-currency bars. No exchange
  rate conversion is attempted.
- Usage-unit cost is hidden when units differ or any project lacks that metric.
- Lowest total, monthly, and usage values are evaluated independently.
- Duration, usage, unit, and currency assumptions remain visible.

All graphic bars include a textual amount and an accessibility label. Color is not the sole carrier
of meaning.

## Export pipeline

`DocumentExporter` receives HTML, checks `ExportAccessPolicy`, creates a cache PDF with
`expo-print`, and opens the native share sheet with `expo-sharing`. The generated cache file is
deleted in `finally`, including share-failure paths. If file generation or sharing is unavailable,
the service opens the system print dialog. If both paths fail, the UI reports a safe error without
changing project data.

Project reports contain project metadata, total/monthly/usage metrics, breakdown, assumptions,
financing, scenario summary, legal notice, app version, and calculation engine version. Free-form
notes and user email are excluded. Comparison reports include each project’s explicit currency and
do not imply currency conversion.

The result card is a compact single-page PDF layout produced by the same safe HTML pipeline.

## Export access

`PhaseSixExportAccessPolicy` grants every export as a free operation. Version 2.0 does not load an
advertising SDK or place an advertising gate in front of PDF and result-card sharing.

## Native verification checklist

1. Export a project report on Android and iOS and inspect every page for clipping.
2. Verify Turkish characters, currency formatting, legal notice, and engine version.
3. Complete and cancel the share sheet; confirm the app remains responsive.
4. Disable sharing availability and confirm the print fallback opens.
5. Export a mixed-currency comparison and confirm the warning appears in both UI and PDF.
6. Verify cache PDFs do not remain after the share operation completes.
