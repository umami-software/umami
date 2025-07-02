import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';
import { useFilterParams } from '@/components/hooks/useFilterParams';

export function useWebsiteSessionsQuery(
  websiteId: string,
  params?: Record<string, string | number>,
) {
  const { get } = useApi();
  const { modified } = useModified(`sessions`);
  const filters = useFilterParams(websiteId);

  return usePagedQuery({
    queryKey: ['sessions', { websiteId, modified, ...params, ...filters }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions`, {
        ...params,
        ...filters,
        pageSize: 20,
      });
    },
  });
}
