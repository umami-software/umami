import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteEventsSeriesQuery(websiteId: string, options?: ReactQueryOptions<any>) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:events:series', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/events/series`, { ...params }),
    enabled: !!websiteId,
    ...options,
  });
}
