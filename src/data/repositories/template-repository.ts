import { and, asc, desc, eq } from 'drizzle-orm';

import { templateCacheTable } from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import type { TemplateDefinition, TemplateRepository } from '@/data/repositories/types';
import { TemplateDefinitionSchema } from '@/data/templates/template-schema';

function parse(payloadJson: string): TemplateDefinition {
  return TemplateDefinitionSchema.parse(JSON.parse(payloadJson));
}

export class SQLiteTemplateRepository<TRunResult> implements TemplateRepository {
  constructor(private readonly db: AppDatabase<TRunResult>) {}

  listActive(): TemplateDefinition[] {
    return this.db
      .select()
      .from(templateCacheTable)
      .where(eq(templateCacheTable.isActive, true))
      .orderBy(asc(templateCacheTable.category), desc(templateCacheTable.version))
      .all()
      .map((row) => parse(row.payloadJson))
      .filter(
        (template, index, templates) =>
          templates.findIndex((candidate) => candidate.id === template.id) === index,
      )
      .sort((left, right) => left.sortOrder - right.sortOrder);
  }

  get(templateId: string, version?: number): TemplateDefinition | null {
    const row = this.db
      .select()
      .from(templateCacheTable)
      .where(
        version === undefined
          ? eq(templateCacheTable.templateId, templateId)
          : and(
              eq(templateCacheTable.templateId, templateId),
              eq(templateCacheTable.version, version),
            ),
      )
      .orderBy(desc(templateCacheTable.version))
      .get();
    return row ? parse(row.payloadJson) : null;
  }
}
