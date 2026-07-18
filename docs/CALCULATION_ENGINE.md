# Calculation Engine

## Scope and invariants

Engine version: `1.0.0` (`CALCULATION_ENGINE_VERSION`).

The engine is deterministic and side-effect free. It imports no React, Expo, Firebase, SQLite, UI,
or locale modules. Inputs are validated with Zod before calculation. Persisted money values are
base-10 integer minor units carried as strings together with an uppercase ISO 4217 currency code.
All arithmetic uses `decimal.js`; native floating-point accumulation is not used for money.

Locale-specific input is a presentation boundary. For example, both Turkish `1.234,56` and English
`1,234.56` become `123456` minor units before entering the domain. The engine never receives a
localized money string.

Intermediate values may contain fractional minor units. Serialization rounds once with
`ROUND_HALF_UP`. This avoids compounding errors when multiple annual or quarterly costs are
converted to monthly equivalents.

## Core equation

```text
initialTotal = sum(initialCost.amount)

monthlyEquivalent =
  monthlyAmount
  or quarterlyAmount / 3
  or semiAnnualAmount / 6
  or annualAmount / 12

recurringTotal = sum(monthlyEquivalent * activeMonths)
totalUsage = usagePerMonth * ownershipMonths
usageCostTotal = costPerUsageUnit * totalUsage

grossCostsBeforeResidual =
  purchasePrice + initialTotal + recurringTotal + usageCostTotal + financingCost

netResidualValue = max(residualValue - sellingCosts, 0)
TCO = grossCostsBeforeResidual - netResidualValue
```

Active months are one-based and inclusive. Missing bounds mean month `1` and `ownershipMonths`;
bounds are clamped to the ownership period. Thus months 3 through 5 represent three active months.

## Fuel and energy

Fuel and energy items provide `consumptionPer100Units` and `unitPriceMinor`:

```text
consumedUnits = totalUsage * consumptionPer100Units / 100
fuelOrEnergyCost = consumedUnits * unitPrice
```

Direct usage costs instead provide `costPerUnitMinor`. When total usage is zero, usage cost is zero,
`costPerUsageMinor` is omitted, and the engine emits `zero_total_usage`.

## Financing

```text
principal = financedAmount
monthlyRate = annualInterestRate / 12 / 100
n = termMonths

if monthlyRate == 0:
  monthlyPayment = principal / n
else:
  monthlyPayment =
    principal * monthlyRate * (1 + monthlyRate)^n
    / ((1 + monthlyRate)^n - 1)

totalLoanPayments = monthlyPayment * n
interestCost = totalLoanPayments - principal
financingCost = interestCost + loanFees
```

Only `interestCost + loanFees` enters TCO. Principal and down payment are parts of the already-counted
purchase price and are never added again. Payment figures remain available in `financingSummary` as
cash-flow information.

## Residual value and derived metrics

Fixed residual value uses `fixedAmountMinor`. Percentage residual value applies
`retainedValuePercent` to the purchase price. Selling costs reduce either value, with net residual
clamped at zero.

```text
monthlyCost = TCO / ownershipMonths
costPerUsage = totalUsage > 0 ? TCO / totalUsage : omitted
purchaseSharePercent = purchasePrice / grossCostsBeforeResidual * 100
hiddenCost = TCO - purchasePrice
hiddenCostRatio = purchasePrice > 0 ? hiddenCost / purchasePrice : null
```

Breakdown values use stable domain keys (`purchase`, `initial`, `recurring`, `usage`, `financing`,
`residual`) rather than localized screen text. Residual is represented as a negative breakdown
value. Percentages are based on gross costs before residual.

## Scenarios

The base project remains immutable. `base`, `lowOverrides`, and `highOverrides` are path/value maps;
an optional explicit `Scenario.overrides` map has final precedence. Supported paths are:

- `project.purchasePriceMinor`, `project.ownershipMonths`, `project.usagePerMonth`
- `financing.downPaymentMinor`, `financedAmountMinor`, `annualInterestRate`, `termMonths`, `loanFeesMinor`
- `residualValue.fixedAmountMinor`, `retainedValuePercent`, `sellingCostsMinor`
- `costItem.<id>.amountMinor`, `costPerUnitMinor`, `consumptionPer100Units`, `unitPriceMinor`,
  `startsAtMonth`, `endsAtMonth`, `isEnabled`

Unknown paths fail explicitly. The merged result is validated again before calculation. No Monte
Carlo behavior exists in this phase.

## Completeness score

The score measures entered-data completeness, not forecast certainty:

- purchase price present: 20 points
- ownership duration present: 20 points
- residual value: 20 points
- at least one recurring cost: 15 points
- positive usage estimate: 20 points
- financing not selected or selected with valid required data: 5 points
- template defaults: subtract 2 points each, capped at 10

Scores are clamped to 0–100. `80–100` is high, `50–79` medium, and below `50` low. Warning codes are
stable localization keys: missing residual, recurring costs, usage estimate, template defaults,
zero purchase price, and zero total usage.

## Comparison constraints

`compareProjects` accepts two or three projects. It never performs currency conversion. Different
currencies suppress rankings and emit a warning. Total, monthly, and usage-unit winners are reported
separately; there is no overall winner. Usage cost is compared only when units match. Different
ownership durations preserve raw totals and monthly metrics, with optional normalization to a
user-selected common positive month count.

## Golden motorcycle example

Inputs (TRY, two decimal minor unit):

- purchase: 300,000.00; ownership: 36 months; usage: 1,000 km/month
- initial registration: 12,000.00; protective gear: 18,000.00
- recurring: insurance 12,000/year, tax 1,800/semiannual, maintenance 6,000/year,
  tires 9,000/year, garage 1,000/month for months 4–36
- fuel: 3.5 L/100 km at 46.00/L
- financing: 150,000 principal, 24% annual rate, 24 months, 3,000 fees
- residual: 210,000 with 5,000 selling costs

Golden outputs:

```text
gross cost before residual = 556,095.95 TRY
net residual              = 205,000.00 TRY
TCO                       = 351,095.95 TRY
hidden cost               =  51,095.95 TRY
monthly cost              =   9,752.67 TRY
cost per km               =       9.75 TRY
```

The executable fixtures live under `src/domain/calculation/__fixtures__`; golden expectations are
asserted by the calculation engine tests.
