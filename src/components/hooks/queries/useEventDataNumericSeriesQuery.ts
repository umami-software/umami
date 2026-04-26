import { serializeEventPropertyFilters } from '@/lib/params';
import type { EventPropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataNumericSeriesQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  metric: 'sum' | 'avg' | 'count',
  eventFilters: EventPropertyFilter[] = [],
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery<any>({
    queryKey: [
      'websites:event-data-pivot:numeric-series',
      { websiteId, eventName, propertyName, metric, eventFilters, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data-pivot/numeric-series`, {
        eventName,
        propertyName,
        metric,
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
