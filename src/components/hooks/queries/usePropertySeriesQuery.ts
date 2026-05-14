import { serializePropertyFilters } from '@/lib/params';
import type { EventDataSeriesPoint, PropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import type { PropertyDataSource } from './usePropertyFieldsQuery';

export function usePropertySeriesQuery(
  source: PropertyDataSource,
  websiteId: string,
  propertyName: string,
  propertyFilters: PropertyFilter[] = [],
  eventName?: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters({ includePagination: false });

  return useQuery<EventDataSeriesPoint[]>({
    queryKey: [
      `websites:${source}-data:property-series`,
      { websiteId, propertyName, eventName, propertyFilters, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(
        source === 'event'
          ? `/websites/${websiteId}/event-data-pivot/property-series`
          : `/websites/${websiteId}/session-data/property-series`,
        {
          ...(source === 'event' ? { eventName } : {}),
          propertyName,
          startAt,
          endAt,
          unit,
          timezone,
          ...serializePropertyFilters(propertyFilters),
          ...params,
        },
      ),
    enabled: !!(websiteId && propertyName && (source === 'session' || eventName)),
    ...options,
  });
}
