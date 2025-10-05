import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteEventsSeriesQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const date = useDateParameters();
  const filters = useFilterParameters();

  return useQuery({
    queryKey: ['websites:events:series', { websiteId, ...date, ...filters }],
    queryFn: () => get(`/websites/${websiteId}/events/series`, { ...date, ...filters }),
    enabled: !!websiteId,
    ...options,
  });
}
