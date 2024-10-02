import { useApi } from './useApi';
import { useFilterParams } from '../useFilterParams';

export function useWebsiteSessionStats(websiteId: string, options?: { [key: string]: string }) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['sessions:stats', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/sessions/stats`, { ...params }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteSessionStats;
