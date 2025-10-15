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
  options?: ReactQueryOptions,
) {
  const { get } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: [
      'websites:events',
      { websiteId, startAt, endAt, unit, timezone, ...filters, ...params },
    ],
    queryFn: pageParams =>
      get(`/websites/${websiteId}/events`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        ...pageParams,
        eventType: EVENT_TYPES[params.view],
      }),
    enabled: !!websiteId,
    ...options,
  });
}
