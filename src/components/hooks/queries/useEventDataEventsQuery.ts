import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export function useEventDataEventsQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const date = useDateParameters();
  const filters = useFilterParameters();

  return useQuery({
    queryKey: ['websites:event-data:events', { websiteId, ...date, ...filters }],
    queryFn: () => get(`/websites/${websiteId}/event-data/events`, { ...date, ...filters }),
    enabled: !!websiteId,
    ...options,
  });
}
