# Domain boundary

Pure entities, value objects, validation, and calculation rules belong here. This layer must not
import React, Expo, Firebase, SQLite, analytics, or advertising packages.

Public exports are exposed by `index.ts`. The calculation entry point is `calculateCostProject`.
Inputs and outputs use integer minor-unit strings and ISO currency codes; locale parsing stays under
`src/utils`. The engine version and formula contract are documented in `docs/CALCULATION_ENGINE.md`.
