import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';

export function useWebsiteSessionStatsQuery(websiteId: string, options?: Record<string, string>) {
  const { get, useQuery } = useApi();
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();

  return useQuery({
    queryKey: ['sessions:stats', { websiteId, ...date, ...filters }],
    queryFn: () => get(`/websites/${websiteId}/sessions/stats`, { ...date, ...filters }),
    enabled: !!websiteId,
    ...options,
  });
}
