import { and, eq, isNull } from 'drizzle-orm';

import { scenarioOverridesTable } from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import {
  defaultRepositoryDependencies,
  type RepositoryDependencies,
} from '@/data/repositories/dependencies';
import { RepositoryNotFoundError } from '@/data/repositories/project-repository';
import { enqueueSync } from '@/data/repositories/sync-queue-writer';
import type { ScenarioOverrideRecord, ScenarioRepository } from '@/data/repositories/types';

function fromRow(row: typeof scenarioOverridesTable.$inferSelect): ScenarioOverrideRecord {
  return {
    id: row.id,
    projectId: row.projectId,
    scenario: row.scenario as ScenarioOverrideRecord['scenario'],
    path: row.path,
    value: JSON.parse(row.valueJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

export class SQLiteScenarioRepository<TRunResult> implements ScenarioRepository {
  constructor(
    private readonly db: AppDatabase<TRunResult>,
    private readonly dependencies: RepositoryDependencies = defaultRepositoryDependencies,
  ) {}

  list(projectId: string): ScenarioOverrideRecord[] {
    return this.db
      .select()
      .from(scenarioOverridesTable)
      .where(
        and(
          eq(scenarioOverridesTable.projectId, projectId),
          isNull(scenarioOverridesTable.deletedAt),
        ),
      )
      .all()
      .map(fromRow);
  }

  replace(
    projectId: string,
    scenario: ScenarioOverrideRecord['scenario'],
    inputs: ScenarioOverrideRecord[],
  ): ScenarioOverrideRecord[] {
    if (inputs.some((input) => input.projectId !== projectId || input.scenario !== scenario)) {
      throw new Error('Scenario replacement contains mismatched records');
    }

    return this.db.transaction((tx) => {
      const existingRows = tx
        .select()
        .from(scenarioOverridesTable)
        .where(
          and(
            eq(scenarioOverridesTable.projectId, projectId),
            eq(scenarioOverridesTable.scenario, scenario),
          ),
        )
        .all();
      const retainedPaths = new Set(inputs.map(({ path }) => path));
      const now = this.dependencies.now();

      for (const existing of existingRows) {
        if (!existing.deletedAt && !retainedPaths.has(existing.path)) {
          tx.update(scenarioOverridesTable)
            .set({
              deletedAt: now,
              updatedAt: now,
              syncStatus: 'pending',
              revision: existing.revision + 1,
              deviceId: this.dependencies.deviceId,
            })
            .where(eq(scenarioOverridesTable.id, existing.id))
            .run();
          enqueueSync(tx, this.dependencies, 'scenario_override', existing.id, 'delete', {
            id: existing.id,
            projectId,
            deletedAt: now,
            revision: existing.revision + 1,
            deviceId: this.dependencies.deviceId,
          });
        }
      }

      return inputs.map((input) => {
        const existing = existingRows.find(({ path }) => path === input.path);
        const revision = (existing?.revision ?? 0) + 1;
        const record: ScenarioOverrideRecord = {
          ...input,
          id: existing?.id ?? input.id,
          createdAt: existing?.createdAt ?? input.createdAt,
          updatedAt: now,
          deletedAt: undefined,
        };
        tx.insert(scenarioOverridesTable)
          .values({
            id: record.id,
            projectId,
            scenario,
            path: record.path,
            valueJson: JSON.stringify(record.value),
            createdAt: record.createdAt,
            updatedAt: now,
            deletedAt: null,
            syncStatus: 'pending',
            revision,
            deviceId: this.dependencies.deviceId,
          })
          .onConflictDoUpdate({
            target: [
              scenarioOverridesTable.projectId,
              scenarioOverridesTable.scenario,
              scenarioOverridesTable.path,
            ],
            set: {
              valueJson: JSON.stringify(record.value),
              updatedAt: now,
              deletedAt: null,
              syncStatus: 'pending',
              revision,
              deviceId: this.dependencies.deviceId,
            },
          })
          .run();
        enqueueSync(tx, this.dependencies, 'scenario_override', record.id, 'upsert', {
          ...record,
          revision,
          deviceId: this.dependencies.deviceId,
        });
        return record;
      });
    });
  }

  upsert(input: ScenarioOverrideRecord): ScenarioOverrideRecord {
    return this.db.transaction((tx) => {
      const existing = tx
        .select()
        .from(scenarioOverridesTable)
        .where(
          and(
            eq(scenarioOverridesTable.projectId, input.projectId),
            eq(scenarioOverridesTable.scenario, input.scenario),
            eq(scenarioOverridesTable.path, input.path),
          ),
        )
        .get();
      const now = this.dependencies.now();
      const record: ScenarioOverrideRecord = {
        ...input,
        id: existing?.id ?? input.id,
        createdAt: existing?.createdAt ?? input.createdAt,
        updatedAt: now,
        deletedAt: undefined,
      };
      tx.insert(scenarioOverridesTable)
        .values({
          id: record.id,
          projectId: record.projectId,
          scenario: record.scenario,
          path: record.path,
          valueJson: JSON.stringify(record.value),
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          deletedAt: null,
          syncStatus: 'pending',
          revision: (existing?.revision ?? 0) + 1,
          deviceId: this.dependencies.deviceId,
        })
        .onConflictDoUpdate({
          target: [
            scenarioOverridesTable.projectId,
            scenarioOverridesTable.scenario,
            scenarioOverridesTable.path,
          ],
          set: {
            valueJson: JSON.stringify(record.value),
            updatedAt: now,
            deletedAt: null,
            syncStatus: 'pending',
            revision: (existing?.revision ?? 0) + 1,
            deviceId: this.dependencies.deviceId,
          },
        })
        .run();
      enqueueSync(tx, this.dependencies, 'scenario_override', record.id, 'upsert', {
        ...record,
        revision: (existing?.revision ?? 0) + 1,
        deviceId: this.dependencies.deviceId,
      });
      return record;
    });
  }

  softDelete(id: string): void {
    this.db.transaction((tx) => {
      const existing = tx
        .select()
        .from(scenarioOverridesTable)
        .where(eq(scenarioOverridesTable.id, id))
        .get();
      if (!existing) throw new RepositoryNotFoundError('scenario override', id);
      const deletedAt = this.dependencies.now();
      tx.update(scenarioOverridesTable)
        .set({
          deletedAt,
          updatedAt: deletedAt,
          syncStatus: 'pending',
          revision: existing.revision + 1,
          deviceId: this.dependencies.deviceId,
        })
        .where(eq(scenarioOverridesTable.id, id))
        .run();
      enqueueSync(tx, this.dependencies, 'scenario_override', id, 'delete', {
        id,
        projectId: existing.projectId,
        deletedAt,
        revision: existing.revision + 1,
        deviceId: this.dependencies.deviceId,
      });
    });
  }
}
