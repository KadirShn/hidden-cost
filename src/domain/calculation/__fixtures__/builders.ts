import type { CostItem, CostProject } from '../../schemas';

const timestamp = '2026-01-01T00:00:00.000Z';

export function projectFixture(overrides: Partial<CostProject> = {}): CostProject {
  return {
    id: 'project-1',
    localOwnerId: 'local-owner-1',
    title: 'Fixture project',
    category: 'custom',
    templateId: 'custom-v1',
    templateVersion: 1,
    currency: 'TRY',
    purchasePriceMinor: '1000000',
    ownershipMonths: 12,
    status: 'complete',
    assumptions: { base: {}, lowOverrides: {}, highOverrides: {} },
    createdAt: timestamp,
    updatedAt: timestamp,
    syncStatus: 'local_only',
    schemaVersion: 1,
    ...overrides,
  };
}

export function costItemFixture(overrides: Partial<CostItem> = {}): CostItem {
  return {
    id: 'item-1',
    projectId: 'project-1',
    type: 'initial',
    label: 'Fixture item',
    amountMinor: '10000',
    isTemplateDefault: false,
    isEnabled: true,
    sortOrder: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}
