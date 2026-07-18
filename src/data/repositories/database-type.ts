import type { DatabaseSchema } from '@/data/database/schema';

import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';

export type AppDatabase<TRunResult = unknown> = BaseSQLiteDatabase<
  'sync',
  TRunResult,
  DatabaseSchema
>;
