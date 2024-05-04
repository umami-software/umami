import { useApi } from './useApi';
import { useFilterParams } from '../useFilterParams';

export function useWebsiteStats(websiteId: string, options?: { [key: string]: string }) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:stats', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/stats`, params),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteStats;
