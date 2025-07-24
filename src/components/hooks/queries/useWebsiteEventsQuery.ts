import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { usePagedQuery } from '../usePagedQuery';
import { ReactQueryOptions } from '@/lib/types';

const EVENT_TYPES = {
  views: 1,
  events: 2,
};

export function useWebsiteEventsQuery(
  websiteId: string,
  params?: Record<string, any>,
  options?: ReactQueryOptions<any>,
) {
  const { get } = useApi();
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: ['websites:events', { websiteId, ...date, ...filters, ...params }],
    queryFn: pageParams =>
      get(`/websites/${websiteId}/events`, {
        ...date,
        ...filters,
        ...pageParams,
        eventType: EVENT_TYPES[params.view],
      }),
    enabled: !!websiteId,
    ...options,
  });
}
