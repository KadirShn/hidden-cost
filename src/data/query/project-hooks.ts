import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';

import { projectKeys } from '@/data/query/query-keys';
import { useRepositories } from '@/data/repositories/repository-provider';
import type {
  DuplicateProjectInput,
  ProjectBundle,
  ProjectDraftPatch,
} from '@/data/repositories/types';
import type { CostItem, CostProject } from '@/domain';

export function useProjects(includeArchived = false) {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: projectKeys.list(includeArchived),
    queryFn: () => projects.list({ includeArchived }),
  });
}

export function useProject(projectId: string) {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projects.getBundle(projectId),
  });
}

export function useProjectBundles(projectIds: string[]) {
  const { projects } = useRepositories();
  return useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: projectKeys.detail(projectId),
      queryFn: () => projects.getBundle(projectId),
    })),
  });
}

export function useCreateProject() {
  const { projects } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      project,
      costItems = [],
    }: {
      project: CostProject;
      costItems?: CostItem[];
    }) => projects.create(project, costItems),
    onSuccess: async ({ project }) => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
    },
  });
}

export function useAutosaveProject(projectId: string) {
  const { projects } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: ProjectDraftPatch) => projects.autosaveDraft(projectId, patch),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const { projects } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: CostProject) => projects.update(project),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useSaveProjectBundle(projectId: string) {
  const { projects } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bundle: ProjectBundle) => projects.saveBundle(bundle),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useUpsertCostItem(projectId: string) {
  const { projects } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: CostItem) => projects.upsertCostItem(item),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useDuplicateProject() {
  const { projects } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DuplicateProjectInput) => projects.duplicate(input),
    onSuccess: async ({ project }) => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
    },
  });
}

export function useArchiveProject() {
  const { projects } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => projects.archive(projectId),
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.id) });
    },
  });
}

export function useSoftDeleteProject() {
  const { projects } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => projects.softDelete(projectId),
    onSuccess: async (_, projectId) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      await queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
