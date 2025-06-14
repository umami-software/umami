import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export function useEventDataQuery(
  websiteId: string,
  eventId: string,
  options?: ReactQueryOptions<any>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:event-data', { websiteId, eventId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/event-data/${eventId}`, { ...params }),
    enabled: !!(websiteId && eventId),
    ...options,
  });
}
