import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { scenarioKeys } from '@/data/query/query-keys';
import { useRepositories } from '@/data/repositories/repository-provider';
import type { ScenarioOverrideRecord } from '@/data/repositories/types';

export function useScenarioOverrides(projectId: string) {
  const { scenarios } = useRepositories();
  return useQuery({
    queryKey: scenarioKeys.project(projectId),
    queryFn: () => scenarios.list(projectId),
  });
}

export function useUpsertScenarioOverride(projectId: string) {
  const { scenarios } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (override: ScenarioOverrideRecord) => scenarios.upsert(override),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scenarioKeys.project(projectId) });
    },
  });
}

export function useDeleteScenarioOverride(projectId: string) {
  const { scenarios } = useRepositories();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => scenarios.softDelete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scenarioKeys.project(projectId) });
    },
  });
}
