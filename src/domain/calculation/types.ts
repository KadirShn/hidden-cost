import { z } from 'zod';

import type { CostItem, CostProject, FinancingPlan, ResidualValue, Scenario } from '../schemas';

export type { CostItem, CostProject, FinancingPlan, ResidualValue, Scenario };

export const CalculationWarningSchema = z.enum([
  'missing_residual_value',
  'missing_recurring_costs',
  'missing_usage_estimate',
  'template_defaults_used',
  'zero_purchase_price',
  'zero_total_usage',
]);
export type CalculationWarning = z.infer<typeof CalculationWarningSchema>;

export const CompletenessLevelSchema = z.enum(['low', 'medium', 'high']);
export type CompletenessLevel = z.infer<typeof CompletenessLevelSchema>;

export const BreakdownItemSchema = z.object({
  key: z.enum(['purchase', 'initial', 'recurring', 'usage', 'financing', 'residual']),
  label: z.string().min(1),
  valueMinor: z.string().regex(/^-?\d+$/),
  percent: z.number().finite(),
});
export type BreakdownItem = z.infer<typeof BreakdownItemSchema>;

export const FinancingSummarySchema = z.object({
  principalMinor: z.string().regex(/^\d+$/),
  monthlyPaymentMinor: z.string().regex(/^\d+$/),
  totalLoanPaymentsMinor: z.string().regex(/^\d+$/),
  interestCostMinor: z.string().regex(/^\d+$/),
  loanFeesMinor: z.string().regex(/^\d+$/),
  financingCostMinor: z.string().regex(/^\d+$/),
});
export type FinancingSummary = z.infer<typeof FinancingSummarySchema>;

export const CalculationResultSchema = z.object({
  calculationEngineVersion: z.string().min(1),
  currency: z.string().regex(/^[A-Z]{3}$/),
  totalCostMinor: z.string().regex(/^-?\d+$/),
  grossCostMinor: z.string().regex(/^\d+$/),
  hiddenCostMinor: z.string().regex(/^-?\d+$/),
  monthlyCostMinor: z.string().regex(/^-?\d+$/),
  costPerUsageMinor: z
    .string()
    .regex(/^-?\d+$/)
    .optional(),
  totalUsage: z.number().finite().nonnegative(),
  purchaseSharePercent: z.number().finite(),
  hiddenCostRatio: z.number().finite().nullable(),
  completenessScore: z.number().int().min(0).max(100),
  completenessLevel: CompletenessLevelSchema,
  breakdown: z.array(BreakdownItemSchema),
  topDrivers: z.array(BreakdownItemSchema),
  financingSummary: FinancingSummarySchema.optional(),
  warnings: z.array(CalculationWarningSchema),
});
export type CalculationResult = z.infer<typeof CalculationResultSchema>;
