import { and, asc, desc, eq, isNull, ne } from 'drizzle-orm';

import { costItemsTable, projectsTable, scenarioOverridesTable } from '@/data/database/schema';
import type { AppDatabase } from '@/data/repositories/database-type';
import {
  defaultRepositoryDependencies,
  type RepositoryDependencies,
} from '@/data/repositories/dependencies';
import { enqueueSync } from '@/data/repositories/sync-queue-writer';
import type {
  DuplicateProjectInput,
  ProjectBundle,
  ProjectDraftPatch,
  ProjectListOptions,
  ProjectRepository,
  ScenarioOverrideRecord,
} from '@/data/repositories/types';
import { CostItemSchema, CostProjectSchema, type CostItem, type CostProject } from '@/domain';

type ProjectRow = typeof projectsTable.$inferSelect;
type ProjectInsert = typeof projectsTable.$inferInsert;
type CostItemRow = typeof costItemsTable.$inferSelect;
type CostItemInsert = typeof costItemsTable.$inferInsert;
type ScenarioRow = typeof scenarioOverridesTable.$inferSelect;

export class RepositoryNotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`);
    this.name = 'RepositoryNotFoundError';
  }
}

function projectFromRow(row: ProjectRow): CostProject {
  return CostProjectSchema.parse({
    id: row.id,
    ownerId: row.ownerId ?? undefined,
    localOwnerId: row.localOwnerId,
    title: row.title,
    category: row.category,
    templateId: row.templateId,
    templateVersion: row.templateVersion,
    currency: row.currency,
    purchasePriceMinor: row.purchasePriceMinor,
    ownershipMonths: row.ownershipMonths,
    usagePerMonth: row.usagePerMonth ?? undefined,
    usageUnit: row.usageUnit ?? undefined,
    status: row.status,
    financing: row.financingJson ? JSON.parse(row.financingJson) : undefined,
    residualValue: row.residualValueJson ? JSON.parse(row.residualValueJson) : undefined,
    assumptions: JSON.parse(row.assumptionsJson),
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
    syncStatus: row.syncStatus,
    schemaVersion: row.schemaVersion,
  });
}

function projectToInsert(
  project: CostProject,
  dependencies: RepositoryDependencies,
  revision = 1,
): ProjectInsert {
  return {
    ...project,
    ownerId: project.ownerId ?? null,
    usagePerMonth: project.usagePerMonth ?? null,
    usageUnit: project.usageUnit ?? null,
    financingJson: project.financing ? JSON.stringify(project.financing) : null,
    residualValueJson: project.residualValue ? JSON.stringify(project.residualValue) : null,
    assumptionsJson: JSON.stringify(project.assumptions),
    notes: project.notes ?? null,
    deletedAt: project.deletedAt ?? null,
    revision,
    deviceId: dependencies.deviceId,
  };
}

function costItemFromRow(row: CostItemRow): CostItem {
  return CostItemSchema.parse({
    id: row.id,
    projectId: row.projectId,
    type: row.type,
    key: row.key ?? undefined,
    label: row.label,
    amountMinor: row.amountMinor ?? undefined,
    frequency: row.frequency ?? undefined,
    costPerUnitMinor: row.costPerUnitMinor ?? undefined,
    unit: row.unit ?? undefined,
    consumptionPer100Units: row.consumptionPer100Units ?? undefined,
    unitPriceMinor: row.unitPriceMinor ?? undefined,
    startsAtMonth: row.startsAtMonth ?? undefined,
    endsAtMonth: row.endsAtMonth ?? undefined,
    isTemplateDefault: row.isTemplateDefault,
    isEnabled: row.isEnabled,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  });
}

function costItemToInsert(
  item: CostItem,
  dependencies: RepositoryDependencies,
  revision = 1,
): CostItemInsert {
  return {
    ...item,
    key: item.key ?? null,
    amountMinor: item.amountMinor ?? null,
    frequency: item.frequency ?? null,
    costPerUnitMinor: item.costPerUnitMinor ?? null,
    unit: item.unit ?? null,
    consumptionPer100Units: item.consumptionPer100Units ?? null,
    unitPriceMinor: item.unitPriceMinor ?? null,
    startsAtMonth: item.startsAtMonth ?? null,
    endsAtMonth: item.endsAtMonth ?? null,
    deletedAt: item.deletedAt ?? null,
    syncStatus: 'pending',
    revision,
    deviceId: dependencies.deviceId,
  };
}

function scenarioFromRow(row: ScenarioRow): ScenarioOverrideRecord {
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

function syncPayload<T extends object>(
  entity: T,
  dependencies: RepositoryDependencies,
  revision: number,
) {
  return { ...entity, revision, deviceId: dependencies.deviceId };
}

export class SQLiteProjectRepository<TRunResult> implements ProjectRepository {
  constructor(
    private readonly db: AppDatabase<TRunResult>,
    private readonly dependencies: RepositoryDependencies = defaultRepositoryDependencies,
  ) {}

  list(options: ProjectListOptions = {}): CostProject[] {
    const conditions = [];
    if (!options.includeDeleted) conditions.push(isNull(projectsTable.deletedAt));
    if (!options.includeArchived) conditions.push(ne(projectsTable.status, 'archived'));
    return this.db
      .select()
      .from(projectsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(projectsTable.updatedAt))
      .all()
      .map(projectFromRow);
  }

  getById(id: string): CostProject | null {
    const row = this.db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), isNull(projectsTable.deletedAt)))
      .get();
    return row ? projectFromRow(row) : null;
  }

  getBundle(id: string): ProjectBundle | null {
    const project = this.getById(id);
    if (!project) return null;
    const costItems = this.db
      .select()
      .from(costItemsTable)
      .where(and(eq(costItemsTable.projectId, id), isNull(costItemsTable.deletedAt)))
      .orderBy(asc(costItemsTable.sortOrder))
      .all()
      .map(costItemFromRow);
    const scenarioOverrides = this.db
      .select()
      .from(scenarioOverridesTable)
      .where(
        and(eq(scenarioOverridesTable.projectId, id), isNull(scenarioOverridesTable.deletedAt)),
      )
      .all()
      .map(scenarioFromRow);
    return { project, costItems, scenarioOverrides };
  }

  create(rawProject: CostProject, rawCostItems: CostItem[] = []): ProjectBundle {
    const now = this.dependencies.now();
    const project = CostProjectSchema.parse({
      ...rawProject,
      createdAt: rawProject.createdAt || now,
      updatedAt: now,
      syncStatus: 'pending',
    });
    const costItems = rawCostItems.map((item) =>
      CostItemSchema.parse({ ...item, projectId: project.id }),
    );

    return this.db.transaction((tx) => {
      tx.insert(projectsTable).values(projectToInsert(project, this.dependencies)).run();
      enqueueSync(
        tx,
        this.dependencies,
        'project',
        project.id,
        'upsert',
        syncPayload(project, this.dependencies, 1),
      );

      for (const item of costItems) {
        tx.insert(costItemsTable).values(costItemToInsert(item, this.dependencies)).run();
        enqueueSync(
          tx,
          this.dependencies,
          'cost_item',
          item.id,
          'upsert',
          syncPayload(item, this.dependencies, 1),
        );
      }
      return { project, costItems, scenarioOverrides: [] };
    });
  }

  saveBundle(rawBundle: ProjectBundle): ProjectBundle {
    return this.db.transaction((tx) => {
      const existingProject = tx
        .select()
        .from(projectsTable)
        .where(and(eq(projectsTable.id, rawBundle.project.id), isNull(projectsTable.deletedAt)))
        .get();
      if (!existingProject) {
        throw new RepositoryNotFoundError('project', rawBundle.project.id);
      }
      const projectRevision = existingProject.revision + 1;
      const project = CostProjectSchema.parse({
        ...rawBundle.project,
        createdAt: existingProject.createdAt,
        updatedAt: this.dependencies.now(),
        syncStatus: 'pending',
      });
      tx.update(projectsTable)
        .set(projectToInsert(project, this.dependencies, projectRevision))
        .where(eq(projectsTable.id, project.id))
        .run();
      enqueueSync(
        tx,
        this.dependencies,
        'project',
        project.id,
        'upsert',
        syncPayload(project, this.dependencies, projectRevision),
      );

      const costItems = rawBundle.costItems.map((rawItem) => {
        const existing = tx
          .select()
          .from(costItemsTable)
          .where(eq(costItemsTable.id, rawItem.id))
          .get();
        const revision = (existing?.revision ?? 0) + 1;
        const item = CostItemSchema.parse({
          ...rawItem,
          projectId: project.id,
          createdAt: existing?.createdAt ?? rawItem.createdAt,
          updatedAt: this.dependencies.now(),
        });
        tx.insert(costItemsTable)
          .values(costItemToInsert(item, this.dependencies, revision))
          .onConflictDoUpdate({
            target: costItemsTable.id,
            set: costItemToInsert(item, this.dependencies, revision),
          })
          .run();
        enqueueSync(
          tx,
          this.dependencies,
          'cost_item',
          item.id,
          'upsert',
          syncPayload(item, this.dependencies, revision),
        );
        return item;
      });

      return { project, costItems, scenarioOverrides: rawBundle.scenarioOverrides };
    });
  }

  update(rawProject: CostProject): CostProject {
    const project = CostProjectSchema.parse(rawProject);
    return this.db.transaction((tx) => {
      const existing = tx
        .select()
        .from(projectsTable)
        .where(eq(projectsTable.id, project.id))
        .get();
      if (!existing) throw new RepositoryNotFoundError('project', project.id);
      const next = CostProjectSchema.parse({
        ...project,
        createdAt: existing.createdAt,
        updatedAt: this.dependencies.now(),
        syncStatus: 'pending',
      });
      tx.update(projectsTable)
        .set(projectToInsert(next, this.dependencies, existing.revision + 1))
        .where(eq(projectsTable.id, project.id))
        .run();
      enqueueSync(
        tx,
        this.dependencies,
        'project',
        project.id,
        'upsert',
        syncPayload(next, this.dependencies, existing.revision + 1),
      );
      return next;
    });
  }

  autosaveDraft(id: string, patch: ProjectDraftPatch): CostProject {
    return this.db.transaction((tx) => {
      const existing = tx.select().from(projectsTable).where(eq(projectsTable.id, id)).get();
      if (!existing || existing.deletedAt) throw new RepositoryNotFoundError('project', id);
      const next = CostProjectSchema.parse({
        ...projectFromRow(existing),
        ...patch,
        status: 'draft',
        updatedAt: this.dependencies.now(),
        syncStatus: 'pending',
      });
      tx.update(projectsTable)
        .set(projectToInsert(next, this.dependencies, existing.revision + 1))
        .where(eq(projectsTable.id, id))
        .run();
      enqueueSync(
        tx,
        this.dependencies,
        'project',
        id,
        'upsert',
        syncPayload(next, this.dependencies, existing.revision + 1),
      );
      return next;
    });
  }

  upsertCostItem(rawItem: CostItem): CostItem {
    const item = CostItemSchema.parse({ ...rawItem, updatedAt: this.dependencies.now() });
    return this.db.transaction((tx) => {
      const project = tx
        .select({ id: projectsTable.id })
        .from(projectsTable)
        .where(and(eq(projectsTable.id, item.projectId), isNull(projectsTable.deletedAt)))
        .get();
      if (!project) throw new RepositoryNotFoundError('project', item.projectId);
      const existing = tx.select().from(costItemsTable).where(eq(costItemsTable.id, item.id)).get();
      tx.insert(costItemsTable)
        .values(costItemToInsert(item, this.dependencies, existing ? existing.revision + 1 : 1))
        .onConflictDoUpdate({
          target: costItemsTable.id,
          set: costItemToInsert(item, this.dependencies, (existing?.revision ?? 0) + 1),
        })
        .run();
      enqueueSync(
        tx,
        this.dependencies,
        'cost_item',
        item.id,
        'upsert',
        syncPayload(item, this.dependencies, (existing?.revision ?? 0) + 1),
      );
      return item;
    });
  }

  softDeleteCostItem(id: string): void {
    this.db.transaction((tx) => {
      const existing = tx.select().from(costItemsTable).where(eq(costItemsTable.id, id)).get();
      if (!existing) throw new RepositoryNotFoundError('cost item', id);
      const deletedAt = this.dependencies.now();
      tx.update(costItemsTable)
        .set({
          deletedAt,
          updatedAt: deletedAt,
          syncStatus: 'pending',
          revision: existing.revision + 1,
          deviceId: this.dependencies.deviceId,
        })
        .where(eq(costItemsTable.id, id))
        .run();
      enqueueSync(tx, this.dependencies, 'cost_item', id, 'delete', {
        id,
        projectId: existing.projectId,
        deletedAt,
        revision: existing.revision + 1,
        deviceId: this.dependencies.deviceId,
      });
    });
  }

  duplicate({ projectId, title }: DuplicateProjectInput): ProjectBundle {
    const source = this.getBundle(projectId);
    if (!source) throw new RepositoryNotFoundError('project', projectId);
    const now = this.dependencies.now();
    const projectIdCopy = this.dependencies.createId();
    const project = CostProjectSchema.parse({
      ...source.project,
      id: projectIdCopy,
      title,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
      syncStatus: 'pending',
    });
    const costItems = source.costItems.map((item) =>
      CostItemSchema.parse({
        ...item,
        id: this.dependencies.createId(),
        projectId: projectIdCopy,
        createdAt: now,
        updatedAt: now,
        deletedAt: undefined,
      }),
    );

    return this.db.transaction((tx) => {
      tx.insert(projectsTable).values(projectToInsert(project, this.dependencies)).run();
      enqueueSync(
        tx,
        this.dependencies,
        'project',
        project.id,
        'upsert',
        syncPayload(project, this.dependencies, 1),
      );
      for (const item of costItems) {
        tx.insert(costItemsTable).values(costItemToInsert(item, this.dependencies)).run();
        enqueueSync(
          tx,
          this.dependencies,
          'cost_item',
          item.id,
          'upsert',
          syncPayload(item, this.dependencies, 1),
        );
      }
      const scenarioOverrides = source.scenarioOverrides.map((override) => ({
        ...override,
        id: this.dependencies.createId(),
        projectId: project.id,
        createdAt: now,
        updatedAt: now,
      }));
      for (const override of scenarioOverrides) {
        tx.insert(scenarioOverridesTable)
          .values({
            ...override,
            valueJson: JSON.stringify(override.value),
            deletedAt: null,
            syncStatus: 'pending',
            revision: 1,
            deviceId: this.dependencies.deviceId,
          })
          .run();
        enqueueSync(
          tx,
          this.dependencies,
          'scenario_override',
          override.id,
          'upsert',
          syncPayload(override, this.dependencies, 1),
        );
      }
      return { project, costItems, scenarioOverrides };
    });
  }

  archive(id: string): CostProject {
    return this.changeStatus(id, 'archived');
  }

  softDelete(id: string): void {
    this.db.transaction((tx) => {
      const project = tx.select().from(projectsTable).where(eq(projectsTable.id, id)).get();
      if (!project) throw new RepositoryNotFoundError('project', id);
      const deletedAt = this.dependencies.now();
      const costItems = tx
        .select()
        .from(costItemsTable)
        .where(and(eq(costItemsTable.projectId, id), isNull(costItemsTable.deletedAt)))
        .all();
      const scenarios = tx
        .select()
        .from(scenarioOverridesTable)
        .where(
          and(eq(scenarioOverridesTable.projectId, id), isNull(scenarioOverridesTable.deletedAt)),
        )
        .all();

      tx.update(projectsTable)
        .set({
          deletedAt,
          updatedAt: deletedAt,
          syncStatus: 'pending',
          revision: project.revision + 1,
          deviceId: this.dependencies.deviceId,
        })
        .where(eq(projectsTable.id, id))
        .run();
      enqueueSync(tx, this.dependencies, 'project', id, 'delete', {
        id,
        deletedAt,
        revision: project.revision + 1,
        deviceId: this.dependencies.deviceId,
      });

      for (const item of costItems) {
        tx.update(costItemsTable)
          .set({
            deletedAt,
            updatedAt: deletedAt,
            syncStatus: 'pending',
            revision: item.revision + 1,
            deviceId: this.dependencies.deviceId,
          })
          .where(eq(costItemsTable.id, item.id))
          .run();
        enqueueSync(tx, this.dependencies, 'cost_item', item.id, 'delete', {
          id: item.id,
          projectId: id,
          deletedAt,
          revision: item.revision + 1,
          deviceId: this.dependencies.deviceId,
        });
      }
      for (const scenario of scenarios) {
        tx.update(scenarioOverridesTable)
          .set({
            deletedAt,
            updatedAt: deletedAt,
            syncStatus: 'pending',
            revision: scenario.revision + 1,
            deviceId: this.dependencies.deviceId,
          })
          .where(eq(scenarioOverridesTable.id, scenario.id))
          .run();
        enqueueSync(tx, this.dependencies, 'scenario_override', scenario.id, 'delete', {
          id: scenario.id,
          projectId: id,
          deletedAt,
          revision: scenario.revision + 1,
          deviceId: this.dependencies.deviceId,
        });
      }
    });
  }

  private changeStatus(id: string, status: CostProject['status']): CostProject {
    return this.db.transaction((tx) => {
      const existing = tx.select().from(projectsTable).where(eq(projectsTable.id, id)).get();
      if (!existing || existing.deletedAt) throw new RepositoryNotFoundError('project', id);
      const next = CostProjectSchema.parse({
        ...projectFromRow(existing),
        status,
        updatedAt: this.dependencies.now(),
        syncStatus: 'pending',
      });
      tx.update(projectsTable)
        .set(projectToInsert(next, this.dependencies, existing.revision + 1))
        .where(eq(projectsTable.id, id))
        .run();
      enqueueSync(
        tx,
        this.dependencies,
        'project',
        id,
        'upsert',
        syncPayload(next, this.dependencies, existing.revision + 1),
      );
      return next;
    });
  }
}
