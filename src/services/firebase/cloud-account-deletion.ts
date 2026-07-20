const DELETE_BATCH_SIZE = 400;

export interface CloudDeletionAdapter {
  listDocumentPaths(collectionPath: string): Promise<string[]>;
  deleteDocumentPaths(documentPaths: string[]): Promise<void>;
}

export async function deleteCloudDocumentTree(
  uid: string,
  adapter: CloudDeletionAdapter,
): Promise<number> {
  if (!uid) throw new Error('cloud-delete/invalid-uid');
  const projectsPath = `users/${uid}/projects`;
  const projectPaths = await adapter.listDocumentPaths(projectsPath);
  const paths: string[] = [];

  for (const projectPath of projectPaths) {
    const [costItems, scenarioOverrides] = await Promise.all([
      adapter.listDocumentPaths(`${projectPath}/costItems`),
      adapter.listDocumentPaths(`${projectPath}/scenarioOverrides`),
    ]);
    paths.push(...costItems, ...scenarioOverrides, projectPath);
  }
  paths.push(`users/${uid}/settings/profile`);

  for (let index = 0; index < paths.length; index += DELETE_BATCH_SIZE) {
    await adapter.deleteDocumentPaths(paths.slice(index, index + DELETE_BATCH_SIZE));
  }
  return paths.length;
}
