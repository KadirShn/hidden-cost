import type { CostItem, CostProject } from '@/domain';

export type ProjectListOptions = {
  includeArchived?: boolean;
  includeDeleted?: boolean;
};

export type ProjectDraftPatch = Partial<
  Pick<
    CostProject,
    | 'title'
    | 'category'
    | 'templateId'
    | 'templateVersion'
    | 'currency'
    | 'purchasePriceMinor'
    | 'ownershipMonths'
    | 'usagePerMonth'
    | 'usageUnit'
    | 'financing'
    | 'residualValue'
    | 'assumptions'
    | 'notes'
  >
>;

export type ProjectBundle = {
  project: CostProject;
  costItems: CostItem[];
  scenarioOverrides: ScenarioOverrideRecord[];
};

export type DuplicateProjectInput = {
  projectId: string;
  title: string;
};

export type ScenarioOverrideRecord = {
  id: string;
  projectId: string;
  scenario: 'low' | 'high';
  path: string;
  value: string | number | boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type TemplateDefinition = {
  id: string;
  version: number;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  category: CostProject['category'];
  defaultCurrency: string;
  defaultOwnershipMonths: number;
  usageUnit: NonNullable<CostProject['usageUnit']>;
  recommendedItems: {
    key: string;
    type: CostItem['type'];
    frequency?: CostItem['frequency'];
    unit?: CostItem['unit'];
    sortOrder: number;
  }[];
  validation: Record<string, string | number | boolean>;
  helpTextKeys: string[];
  sortOrder: number;
  isActive: boolean;
};

export type UserProfileRecord = {
  id: string;
  authType: 'anonymous' | 'email' | 'google';
  displayName?: string;
  email?: string;
  locale: 'tr' | 'en';
  defaultCurrency: string;
  theme: 'system' | 'light' | 'dark';
  cloudBackupEnabled: boolean;
  analyticsConsent: boolean;
  adsConsentStatus: 'unknown' | 'required' | 'obtained' | 'not_required';
  createdAt: string;
  updatedAt: string;
  revision: number;
  deviceId: string;
};

export type SyncQueueRecord = {
  id: string;
  entityType: 'project' | 'cost_item' | 'profile' | 'scenario_override';
  entityId: string;
  operation: 'upsert' | 'delete';
  payloadJson: string;
  attemptCount: number;
  nextAttemptAt?: string;
  createdAt: string;
  lastError?: string;
};

export interface ProjectRepository {
  list(options?: ProjectListOptions): CostProject[];
  getById(id: string): CostProject | null;
  getBundle(id: string): ProjectBundle | null;
  create(project: CostProject, costItems?: CostItem[]): ProjectBundle;
  saveBundle(bundle: ProjectBundle): ProjectBundle;
  update(project: CostProject): CostProject;
  autosaveDraft(id: string, patch: ProjectDraftPatch): CostProject;
  upsertCostItem(item: CostItem): CostItem;
  softDeleteCostItem(id: string): void;
  duplicate(input: DuplicateProjectInput): ProjectBundle;
  archive(id: string): CostProject;
  softDelete(id: string): void;
}

export interface ScenarioRepository {
  list(projectId: string): ScenarioOverrideRecord[];
  replace(
    projectId: string,
    scenario: ScenarioOverrideRecord['scenario'],
    overrides: ScenarioOverrideRecord[],
  ): ScenarioOverrideRecord[];
  upsert(override: ScenarioOverrideRecord): ScenarioOverrideRecord;
  softDelete(id: string): void;
}

export interface TemplateRepository {
  listActive(): TemplateDefinition[];
  get(templateId: string, version?: number): TemplateDefinition | null;
}

export interface UserProfileRepository {
  get(id: string): UserProfileRecord | null;
  upsert(profile: UserProfileRecord): UserProfileRecord;
}

export interface AppSettingsRepository {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
}

export interface SyncQueueRepository {
  listReady(now?: string): SyncQueueRecord[];
  recordFailure(id: string, errorCode: string, nextAttemptAt: string): void;
  remove(id: string): void;
}
