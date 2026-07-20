import { describe, expect, it } from '@jest/globals';

import { deleteCloudDocumentTree, type CloudDeletionAdapter } from './cloud-account-deletion';

describe('deleteCloudDocumentTree', () => {
  it('deletes nested documents before their projects and includes profile settings', async () => {
    const deleted: string[][] = [];
    const adapter: CloudDeletionAdapter = {
      listDocumentPaths: async (path) => {
        if (path === 'users/alice/projects') {
          return ['users/alice/projects/a', 'users/alice/projects/b'];
        }
        if (path.endsWith('/costItems')) return [`${path}/cost`];
        if (path.endsWith('/scenarioOverrides')) return [`${path}/scenario`];
        return [];
      },
      deleteDocumentPaths: async (paths) => {
        deleted.push(paths);
      },
    };

    await expect(deleteCloudDocumentTree('alice', adapter)).resolves.toBe(7);
    expect(deleted.flat()).toEqual([
      'users/alice/projects/a/costItems/cost',
      'users/alice/projects/a/scenarioOverrides/scenario',
      'users/alice/projects/a',
      'users/alice/projects/b/costItems/cost',
      'users/alice/projects/b/scenarioOverrides/scenario',
      'users/alice/projects/b',
      'users/alice/settings/profile',
    ]);
  });

  it('chunks large deletions below the Firestore batch limit', async () => {
    const batches: string[][] = [];
    const adapter: CloudDeletionAdapter = {
      listDocumentPaths: async (path) =>
        path === 'users/alice/projects'
          ? Array.from({ length: 401 }, (_, index) => `users/alice/projects/${index}`)
          : [],
      deleteDocumentPaths: async (paths) => {
        batches.push(paths);
      },
    };

    await deleteCloudDocumentTree('alice', adapter);
    expect(batches.map((batch) => batch.length)).toEqual([400, 2]);
  });
});
