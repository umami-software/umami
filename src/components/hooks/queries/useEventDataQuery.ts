import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export function useEventDataQuery(websiteId: string, eventId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const date = useDateParameters(websiteId);
  const params = useFilterParameters();

  return useQuery({
    queryKey: ['websites:event-data', { websiteId, eventId, ...date, ...params }],
    queryFn: () => get(`/websites/${websiteId}/event-data/${eventId}`, { ...date, ...params }),
    enabled: !!(websiteId && eventId),
    ...options,
  });
}
