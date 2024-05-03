import useApi from './useApi';
import { useFilterParams } from '../useFilterParams';

export function useWebsiteEvents(websiteId: string, options?: { [key: string]: string }) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:events', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/events`, params),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteEvents;
