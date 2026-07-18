import { useQuery } from '@tanstack/react-query';

import { templateKeys } from '@/data/query/query-keys';
import { useRepositories } from '@/data/repositories/repository-provider';

export function useTemplates() {
  const { templates } = useRepositories();
  return useQuery({ queryKey: templateKeys.active(), queryFn: () => templates.listActive() });
}

export function useTemplate(templateId: string, version?: number) {
  const { templates } = useRepositories();
  return useQuery({
    queryKey: templateKeys.detail(templateId, version),
    queryFn: () => templates.get(templateId, version),
  });
}
