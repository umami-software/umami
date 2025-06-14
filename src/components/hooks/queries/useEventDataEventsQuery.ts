import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export function useEventDataEventsQuery(websiteId: string, options?: ReactQueryOptions<any>) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:event-data:events', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/event-data/events`, { ...params }),
    enabled: !!websiteId,
    ...options,
  });
}
