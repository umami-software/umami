import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';

export function useWebsiteSessionsQuery(
  websiteId: string,
  params?: Record<string, string | number>,
) {
  const { get } = useApi();
  const { modified } = useModified(`sessions`);
  const date = useDateParameters();
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: ['sessions', { websiteId, modified, ...params, ...date, ...filters }],
    queryFn: pageParams => {
      return get(`/websites/${websiteId}/sessions`, {
        ...date,
        ...filters,
        ...pageParams,
        ...params,
        pageSize: 20,
      });
    },
  });
}
