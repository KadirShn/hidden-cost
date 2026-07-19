import { describe, expect, it } from '@jest/globals';

import { createTestDatabase } from '@/data/database/testing/test-database';
import { SQLiteProjectRepository } from '@/data/repositories/project-repository';
import { calculateCostProject } from '@/domain';
import { costItemFixture, projectFixture } from '@/domain/calculation/__fixtures__/builders';

describe('offline main calculation flow', () => {
  it('creates, calculates, saves, and reopens a project without Firebase', () => {
    const { sqlite, database } = createTestDatabase();
    let generatedId = 0;
    const dependencies = {
      createId: () => `offline-id-${++generatedId}`,
      deviceId: 'offline-device',
      now: () => '2026-07-19T10:00:00.000Z',
    };
    const repository = new SQLiteProjectRepository(database, dependencies);
    const project = projectFixture({
      id: 'offline-motorcycle',
      category: 'motorcycle',
      status: 'complete',
      purchasePriceMinor: '30000000',
      ownershipMonths: 36,
    });
    const maintenance = costItemFixture({
      id: 'maintenance',
      projectId: project.id,
      key: 'maintenance',
      type: 'recurring',
      frequency: 'annual',
      amountMinor: '1200000',
    });

    repository.create(project, [maintenance]);
    const saved = repository.getBundle(project.id);
    expect(saved).not.toBeNull();
    const result = calculateCostProject({
      project: saved!.project,
      costItems: saved!.costItems,
    });
    expect(result.totalCostMinor).toBe('33600000');

    const reopened = new SQLiteProjectRepository(database, dependencies).getBundle(project.id);
    expect(reopened).toMatchObject({ project: { id: project.id, status: 'complete' } });
    sqlite.close();
  });
});
