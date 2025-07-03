import { useApi } from '../useApi';
import { UseQueryOptions } from '@tanstack/react-query';
import { useFilterParams } from '../useFilterParams';

export function useEventDataEvents(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:event-data:events', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/event-data/events`, { ...params }, { headers: { 'CF-Access-Client-Id': '571942449727ad914a422562e7931a4a.access', 'CF-Access-Client-Secret': '571942449727ad914a422562e7931a4a.secret' } }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useEventDataEvents;
