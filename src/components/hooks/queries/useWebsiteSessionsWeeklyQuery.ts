import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '@/components/hooks/useFilterParameters';

export function useWebsiteSessionsWeeklyQuery(
  websiteId: string,
  params?: Record<string, string | number>,
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`sessions`);
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();

  return useQuery({
    queryKey: ['sessions', { websiteId, modified, ...params, ...date, ...filters }],
    queryFn: () => {
      return get(`/websites/${websiteId}/sessions/weekly`, {
        ...params,
        ...date,
        ...filters,
      });
    },
  });
}
