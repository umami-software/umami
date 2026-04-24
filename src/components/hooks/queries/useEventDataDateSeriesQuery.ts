import { serializeEventPropertyFilters } from '@/lib/params';
import type { EventDataDateSeriesPoint, EventPropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataDateSeriesQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  eventFilters: EventPropertyFilter[] = [],
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery<EventDataDateSeriesPoint[]>({
    queryKey: [
      'websites:event-data-pivot:date-series',
      {
        websiteId,
        eventName,
        propertyName,
        eventFilters,
        startAt,
        endAt,
        timezone,
        ...params,
      },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data-pivot/date-series`, {
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
