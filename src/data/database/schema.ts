import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const userProfileTable = sqliteTable('user_profile', {
  id: text('id').primaryKey(),
  authType: text('auth_type').notNull(),
  displayName: text('display_name'),
  email: text('email'),
  locale: text('locale').notNull(),
  defaultCurrency: text('default_currency').notNull(),
  theme: text('theme').notNull(),
  cloudBackupEnabled: integer('cloud_backup_enabled', { mode: 'boolean' }).notNull(),
  analyticsConsent: integer('analytics_consent', { mode: 'boolean' }).notNull(),
  adsConsentStatus: text('ads_consent_status').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  revision: integer('revision').notNull().default(1),
  deviceId: text('device_id').notNull(),
});

export const projectsTable = sqliteTable(
  'projects',
  {
    id: text('id').primaryKey(),
    ownerId: text('owner_id'),
    localOwnerId: text('local_owner_id').notNull(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    templateId: text('template_id').notNull(),
    templateVersion: integer('template_version').notNull(),
    currency: text('currency').notNull(),
    purchasePriceMinor: text('purchase_price_minor').notNull(),
    ownershipMonths: integer('ownership_months').notNull(),
    usagePerMonth: real('usage_per_month'),
    usageUnit: text('usage_unit'),
    status: text('status').notNull(),
    financingJson: text('financing_json'),
    residualValueJson: text('residual_value_json'),
    assumptionsJson: text('assumptions_json').notNull(),
    notes: text('notes'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
    syncStatus: text('sync_status').notNull(),
    schemaVersion: integer('schema_version').notNull(),
    revision: integer('revision').notNull().default(1),
    deviceId: text('device_id').notNull(),
  },
  (table) => [
    index('projects_owner_status_idx').on(table.localOwnerId, table.status),
    index('projects_updated_at_idx').on(table.updatedAt),
    index('projects_deleted_at_idx').on(table.deletedAt),
  ],
);

export const costItemsTable = sqliteTable(
  'cost_items',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projectsTable.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    key: text('key'),
    label: text('label').notNull(),
    amountMinor: text('amount_minor'),
    frequency: text('frequency'),
    costPerUnitMinor: text('cost_per_unit_minor'),
    unit: text('unit'),
    consumptionPer100Units: real('consumption_per_100_units'),
    unitPriceMinor: text('unit_price_minor'),
    startsAtMonth: integer('starts_at_month'),
    endsAtMonth: integer('ends_at_month'),
    isTemplateDefault: integer('is_template_default', { mode: 'boolean' }).notNull(),
    isEnabled: integer('is_enabled', { mode: 'boolean' }).notNull(),
    sortOrder: integer('sort_order').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
    syncStatus: text('sync_status').notNull().default('local_only'),
    revision: integer('revision').notNull().default(1),
    deviceId: text('device_id').notNull(),
  },
  (table) => [
    index('cost_items_project_sort_idx').on(table.projectId, table.sortOrder),
    index('cost_items_deleted_at_idx').on(table.deletedAt),
  ],
);

export const scenarioOverridesTable = sqliteTable(
  'scenario_overrides',
  {
    id: text('id').primaryKey(),
    projectId: text('project_id')
      .notNull()
      .references(() => projectsTable.id, { onDelete: 'cascade' }),
    scenario: text('scenario').notNull(),
    path: text('path').notNull(),
    valueJson: text('value_json').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
    syncStatus: text('sync_status').notNull().default('local_only'),
    revision: integer('revision').notNull().default(1),
    deviceId: text('device_id').notNull(),
  },
  (table) => [
    uniqueIndex('scenario_override_path_idx').on(table.projectId, table.scenario, table.path),
    index('scenario_override_deleted_at_idx').on(table.deletedAt),
  ],
);

export const templateCacheTable = sqliteTable(
  'template_cache',
  {
    templateId: text('template_id').notNull(),
    version: integer('version').notNull(),
    category: text('category').notNull(),
    payloadJson: text('payload_json').notNull(),
    source: text('source').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull(),
    updatedAt: text('updated_at').notNull(),
    expiresAt: text('expires_at'),
  },
  (table) => [
    primaryKey({ columns: [table.templateId, table.version] }),
    index('template_cache_category_active_idx').on(table.category, table.isActive),
  ],
);

export const syncQueueTable = sqliteTable(
  'sync_queue',
  {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    operation: text('operation').notNull(),
    payloadJson: text('payload_json').notNull(),
    attemptCount: integer('attempt_count').notNull().default(0),
    nextAttemptAt: text('next_attempt_at'),
    createdAt: text('created_at').notNull(),
    lastError: text('last_error'),
  },
  (table) => [
    uniqueIndex('sync_queue_entity_idx').on(table.entityType, table.entityId),
    index('sync_queue_next_attempt_idx').on(table.nextAttemptAt, table.createdAt),
  ],
);

export const appSettingsTable = sqliteTable('app_settings', {
  key: text('key').primaryKey(),
  valueJson: text('value_json').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const schemaMigrationsTable = sqliteTable('schema_migrations', {
  version: integer('version').primaryKey(),
  name: text('name').notNull(),
  checksum: text('checksum').notNull(),
  appliedAt: text('applied_at').notNull(),
});

export const databaseSchema = {
  userProfileTable,
  projectsTable,
  costItemsTable,
  scenarioOverridesTable,
  templateCacheTable,
  syncQueueTable,
  appSettingsTable,
  schemaMigrationsTable,
};

export type DatabaseSchema = typeof databaseSchema;
