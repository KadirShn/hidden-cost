import { z } from 'zod';

export const CurrencyCodeSchema = z.string().regex(/^[A-Z]{3}$/, 'Expected ISO 4217 code');
export const MinorUnitSchema = z
  .string()
  .regex(/^\d+$/, 'Expected non-negative integer minor units');
const OptionalDateTimeSchema = z.string().datetime({ offset: true }).optional();
const PrimitiveSchema = z.union([z.string(), z.number().finite(), z.boolean()]);
const OverrideRecordSchema = z.record(z.string(), PrimitiveSchema);

export const FinancingPlanSchema = z
  .object({
    enabled: z.boolean(),
    downPaymentMinor: MinorUnitSchema,
    financedAmountMinor: MinorUnitSchema,
    annualInterestRate: z.number().finite().nonnegative(),
    termMonths: z.number().int().nonnegative(),
    loanFeesMinor: MinorUnitSchema,
  })
  .superRefine((plan, context) => {
    if (plan.enabled && plan.termMonths < 1) {
      context.addIssue({
        code: 'custom',
        path: ['termMonths'],
        message: 'Enabled financing requires a positive term',
      });
    }
    if (plan.enabled && plan.financedAmountMinor === '0') {
      context.addIssue({
        code: 'custom',
        path: ['financedAmountMinor'],
        message: 'Enabled financing requires a positive principal',
      });
    }
  });

export const ResidualValueSchema = z
  .object({
    mode: z.enum(['fixed', 'percentage']),
    fixedAmountMinor: MinorUnitSchema.optional(),
    retainedValuePercent: z.number().finite().min(0).max(100).optional(),
    sellingCostsMinor: MinorUnitSchema,
  })
  .superRefine((residual, context) => {
    if (residual.mode === 'fixed' && residual.fixedAmountMinor === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['fixedAmountMinor'],
        message: 'Fixed value required',
      });
    }
    if (residual.mode === 'percentage' && residual.retainedValuePercent === undefined) {
      context.addIssue({
        code: 'custom',
        path: ['retainedValuePercent'],
        message: 'Retained value percentage required',
      });
    }
  });

export const AssumptionSetSchema = z.object({
  base: OverrideRecordSchema,
  lowOverrides: OverrideRecordSchema,
  highOverrides: OverrideRecordSchema,
});

export const CostProjectSchema = z.object({
  id: z.string().min(1),
  ownerId: z.string().min(1).optional(),
  localOwnerId: z.string().min(1),
  title: z.string().min(1),
  category: z.enum(['car', 'motorcycle', 'boat', 'electronics', 'subscription', 'custom']),
  templateId: z.string().min(1),
  templateVersion: z.number().int().positive(),
  currency: CurrencyCodeSchema,
  purchasePriceMinor: MinorUnitSchema,
  ownershipMonths: z.number().int().positive(),
  usagePerMonth: z.number().finite().nonnegative().optional(),
  usageUnit: z.enum(['km', 'hour', 'use', 'month']).optional(),
  status: z.enum(['draft', 'complete', 'archived']),
  financing: FinancingPlanSchema.optional(),
  residualValue: ResidualValueSchema.optional(),
  assumptions: AssumptionSetSchema,
  notes: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  deletedAt: OptionalDateTimeSchema,
  syncStatus: z.enum(['local_only', 'pending', 'synced', 'conflict', 'failed']),
  schemaVersion: z.number().int().positive(),
});

export const CostItemSchema = z
  .object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    type: z.enum(['initial', 'recurring', 'usage']),
    key: z.string().min(1).optional(),
    label: z.string().min(1),
    amountMinor: MinorUnitSchema.optional(),
    frequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']).optional(),
    costPerUnitMinor: MinorUnitSchema.optional(),
    unit: z.enum(['km', 'hour', 'use', 'liter', 'kwh']).optional(),
    consumptionPer100Units: z.number().finite().nonnegative().optional(),
    unitPriceMinor: MinorUnitSchema.optional(),
    startsAtMonth: z.number().int().positive().optional(),
    endsAtMonth: z.number().int().positive().optional(),
    isTemplateDefault: z.boolean(),
    isEnabled: z.boolean(),
    sortOrder: z.number().int(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
    deletedAt: OptionalDateTimeSchema,
  })
  .superRefine((item, context) => {
    if ((item.type === 'initial' || item.type === 'recurring') && item.amountMinor === undefined) {
      context.addIssue({ code: 'custom', path: ['amountMinor'], message: 'Amount required' });
    }
    if (item.type === 'recurring' && item.frequency === undefined) {
      context.addIssue({ code: 'custom', path: ['frequency'], message: 'Frequency required' });
    }
    const hasDirectUsageCost = item.costPerUnitMinor !== undefined;
    const hasConsumptionCost =
      item.consumptionPer100Units !== undefined && item.unitPriceMinor !== undefined;
    if (item.type === 'usage' && !hasDirectUsageCost && !hasConsumptionCost) {
      context.addIssue({
        code: 'custom',
        path: ['costPerUnitMinor'],
        message: 'Usage item requires direct unit cost or consumption and unit price',
      });
    }
    if (
      item.startsAtMonth !== undefined &&
      item.endsAtMonth !== undefined &&
      item.endsAtMonth < item.startsAtMonth
    ) {
      context.addIssue({ code: 'custom', path: ['endsAtMonth'], message: 'End precedes start' });
    }
  });

export const ScenarioSchema = z.object({
  kind: z.enum(['low', 'base', 'high']),
  overrides: OverrideRecordSchema.optional(),
});

export const CalculationInputSchema = z
  .object({
    project: CostProjectSchema,
    costItems: z.array(CostItemSchema),
    scenario: ScenarioSchema.optional(),
  })
  .superRefine((input, context) => {
    input.costItems.forEach((item, index) => {
      if (item.projectId !== input.project.id) {
        context.addIssue({
          code: 'custom',
          path: ['costItems', index, 'projectId'],
          message: 'Cost item belongs to another project',
        });
      }
    });
  });

export type FinancingPlan = z.infer<typeof FinancingPlanSchema>;
export type ResidualValue = z.infer<typeof ResidualValueSchema>;
export type AssumptionSet = z.infer<typeof AssumptionSetSchema>;
export type CostProject = z.infer<typeof CostProjectSchema>;
export type CostItem = z.infer<typeof CostItemSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type CalculationInput = z.infer<typeof CalculationInputSchema>;
