import { z } from 'zod';

export const TemplateDefinitionSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  titleKey: z.string().min(1),
  descriptionKey: z.string().min(1),
  icon: z.string().min(1),
  category: z.enum(['car', 'motorcycle', 'boat', 'electronics', 'subscription', 'custom']),
  defaultCurrency: z.string().regex(/^[A-Z]{3}$/),
  defaultOwnershipMonths: z.number().int().positive(),
  usageUnit: z.enum(['km', 'hour', 'use', 'month']),
  recommendedItems: z.array(
    z.object({
      key: z.string().min(1),
      type: z.enum(['initial', 'recurring', 'usage']),
      frequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']).optional(),
      unit: z.enum(['km', 'hour', 'use', 'liter', 'kwh']).optional(),
      sortOrder: z.number().int(),
    }),
  ),
  validation: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  helpTextKeys: z.array(z.string()),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});
