import { templateCacheTable } from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import { seedTemplates } from '@/data/templates/seed-templates';
import { TemplateDefinitionSchema } from '@/data/templates/template-schema';

export function seedTemplateCache<TRunResult>(
  db: AppDatabase<TRunResult>,
  now: () => string = () => new Date().toISOString(),
): void {
  db.transaction((tx) => {
    for (const rawTemplate of seedTemplates) {
      const template = TemplateDefinitionSchema.parse(rawTemplate);
      tx.insert(templateCacheTable)
        .values({
          templateId: template.id,
          version: template.version,
          category: template.category,
          payloadJson: JSON.stringify(template),
          source: 'seed',
          isActive: template.isActive,
          updatedAt: now(),
        })
        .onConflictDoNothing()
        .run();
    }
  });
}
