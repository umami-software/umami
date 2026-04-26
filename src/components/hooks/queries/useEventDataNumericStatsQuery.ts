import { serializeEventPropertyFilters } from '@/lib/params';
import type { EventDataNumericStats, EventPropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataNumericStatsQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  eventFilters: EventPropertyFilter[] = [],
  options?: ReactQueryOptions<EventDataNumericStats>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery<EventDataNumericStats>({
    queryKey: [
      'websites:event-data-pivot:numeric-stats',
      { websiteId, eventName, propertyName, eventFilters, startAt, endAt, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data-pivot/numeric-stats`, {
        eventName,
        propertyName,
        startAt,
        endAt,
        timezone,
        ...serializeEventPropertyFilters(eventFilters),
        ...params,
      }),
    enabled: !!(websiteId && eventName && propertyName),
    ...options,
  });
}
