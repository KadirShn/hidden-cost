import { describe, expect, it } from '@jest/globals';

import { createTestDatabase } from '@/data/database/testing/test-database';
import { SQLiteTemplateRepository } from '@/data/repositories/template-repository';
import { seedTemplateCache } from '@/data/templates/seed';

describe('template seed', () => {
  it('inserts all six MVP categories idempotently', () => {
    const { sqlite, database } = createTestDatabase();
    seedTemplateCache(database, () => '2026-01-01T00:00:00.000Z');
    seedTemplateCache(database, () => '2026-01-02T00:00:00.000Z');

    const templates = new SQLiteTemplateRepository(database).listActive();
    expect(templates.map(({ category }) => category)).toEqual([
      'car',
      'motorcycle',
      'boat',
      'electronics',
      'subscription',
      'custom',
    ]);
    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM template_cache').get()).toEqual({
      count: 6,
    });
    sqlite.close();
  });
});
