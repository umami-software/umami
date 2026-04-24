import { serializeEventPropertyFilters } from '@/lib/params';
import type { EventDataSeriesPoint, EventPropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataPropertySeriesQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  eventFilters: EventPropertyFilter[] = [],
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery<EventDataSeriesPoint[]>({
    queryKey: [
      'websites:event-data-pivot:property-series',
      { websiteId, eventName, propertyName, eventFilters, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data-pivot/property-series`, {
        eventName,
        propertyName,
        startAt,
        endAt,
        unit,
        timezone,
        ...serializeEventPropertyFilters(eventFilters),
        ...params,
      }),
    enabled: !!(websiteId && eventName && propertyName),
    ...options,
  });
}
