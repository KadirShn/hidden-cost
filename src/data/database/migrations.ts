export type Migration = Readonly<{
  version: number;
  name: string;
  checksum: string;
  sql: string;
}>;

export const migrations: readonly Migration[] = [
  {
    version: 1,
    name: 'phase_4_initial_schema',
    checksum: 'phase4-initial-schema-v1',
    sql: `
      CREATE TABLE user_profile (
        id TEXT PRIMARY KEY NOT NULL,
        auth_type TEXT NOT NULL,
        display_name TEXT,
        email TEXT,
        locale TEXT NOT NULL,
        default_currency TEXT NOT NULL,
        theme TEXT NOT NULL,
        cloud_backup_enabled INTEGER NOT NULL,
        analytics_consent INTEGER NOT NULL,
        ads_consent_status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1,
        device_id TEXT NOT NULL
      );

      CREATE TABLE projects (
        id TEXT PRIMARY KEY NOT NULL,
        owner_id TEXT,
        local_owner_id TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        template_id TEXT NOT NULL,
        template_version INTEGER NOT NULL,
        currency TEXT NOT NULL,
        purchase_price_minor TEXT NOT NULL,
        ownership_months INTEGER NOT NULL,
        usage_per_month REAL,
        usage_unit TEXT,
        status TEXT NOT NULL,
        financing_json TEXT,
        residual_value_json TEXT,
        assumptions_json TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL,
        schema_version INTEGER NOT NULL,
        revision INTEGER NOT NULL DEFAULT 1,
        device_id TEXT NOT NULL
      );
      CREATE INDEX projects_owner_status_idx ON projects(local_owner_id, status);
      CREATE INDEX projects_updated_at_idx ON projects(updated_at);
      CREATE INDEX projects_deleted_at_idx ON projects(deleted_at);

      CREATE TABLE cost_items (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        key TEXT,
        label TEXT NOT NULL,
        amount_minor TEXT,
        frequency TEXT,
        cost_per_unit_minor TEXT,
        unit TEXT,
        consumption_per_100_units REAL,
        unit_price_minor TEXT,
        starts_at_month INTEGER,
        ends_at_month INTEGER,
        is_template_default INTEGER NOT NULL,
        is_enabled INTEGER NOT NULL,
        sort_order INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT 'local_only',
        revision INTEGER NOT NULL DEFAULT 1,
        device_id TEXT NOT NULL
      );
      CREATE INDEX cost_items_project_sort_idx ON cost_items(project_id, sort_order);
      CREATE INDEX cost_items_deleted_at_idx ON cost_items(deleted_at);

      CREATE TABLE scenario_overrides (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        scenario TEXT NOT NULL,
        path TEXT NOT NULL,
        value_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT,
        sync_status TEXT NOT NULL DEFAULT 'local_only',
        revision INTEGER NOT NULL DEFAULT 1,
        device_id TEXT NOT NULL
      );
      CREATE UNIQUE INDEX scenario_override_path_idx
        ON scenario_overrides(project_id, scenario, path);
      CREATE INDEX scenario_override_deleted_at_idx ON scenario_overrides(deleted_at);

      CREATE TABLE template_cache (
        template_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        category TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        source TEXT NOT NULL,
        is_active INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        expires_at TEXT,
        PRIMARY KEY(template_id, version)
      );
      CREATE INDEX template_cache_category_active_idx ON template_cache(category, is_active);

      CREATE TABLE sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        next_attempt_at TEXT,
        created_at TEXT NOT NULL,
        last_error TEXT
      );
      CREATE UNIQUE INDEX sync_queue_entity_idx ON sync_queue(entity_type, entity_id);
      CREATE INDEX sync_queue_next_attempt_idx ON sync_queue(next_attempt_at, created_at);

      CREATE TABLE app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value_json TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `,
  },
];
