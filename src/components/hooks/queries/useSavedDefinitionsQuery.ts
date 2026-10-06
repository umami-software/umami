import type { Report } from '@/generated/prisma/client';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

function useDefinitionsQuery(
  feature: 'funnels' | 'goals',
  websiteId: string,
  options?: ReactQueryOptions,
) {
  const { modified } = useModified(`websites:${feature}`);
  const { get } = useApi();
  return usePagedQuery({
    queryKey: [`websites:${feature}`, { websiteId, modified }],
    queryFn: params => get(`/websites/${websiteId}/${feature}`, params),
    enabled: !!websiteId,
    ...options,
  });
}
function useDefinitionQuery(feature: 'funnels' | 'goals', websiteId: string, id: string) {
  const { modified } = useModified(`websites:${feature}`);
  const { get, useQuery } = useApi();
  return useQuery<Omit<Report, 'parameters'> & { parameters: any }>({
    queryKey: [`websites:${feature}:definition`, { websiteId, id, modified }],
    queryFn: () => get(`/websites/${websiteId}/${feature}/${id}`),
    enabled: !!websiteId && !!id,
  });
}
export function useFunnelsQuery({ websiteId }: { websiteId: string }, options?: ReactQueryOptions) {
  return useDefinitionsQuery('funnels', websiteId, options);
}
export function useGoalsQuery({ websiteId }: { websiteId: string }, options?: ReactQueryOptions) {
  return useDefinitionsQuery('goals', websiteId, options);
}
export function useFunnelDefinitionQuery(websiteId: string, id: string) {
  return useDefinitionQuery('funnels', websiteId, id);
}
export function useGoalDefinitionQuery(websiteId: string, id: string) {
  return useDefinitionQuery('goals', websiteId, id);
}
