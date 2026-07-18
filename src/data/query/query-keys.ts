export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (includeArchived = false) => [...projectKeys.lists(), { includeArchived }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export const templateKeys = {
  all: ['templates'] as const,
  active: () => [...templateKeys.all, 'active'] as const,
  detail: (id: string, version?: number) => [...templateKeys.all, id, version ?? 'latest'] as const,
};

export const scenarioKeys = {
  all: ['scenarios'] as const,
  project: (projectId: string) => [...scenarioKeys.all, projectId] as const,
};
