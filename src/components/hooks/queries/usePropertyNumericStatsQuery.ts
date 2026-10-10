import { serializePropertyFilters } from '@/lib/params';
import type { EventDataNumericStats, PropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import type { PropertyDataSource } from './usePropertyFieldsQuery';

export function usePropertyNumericStatsQuery(
  source: PropertyDataSource,
  websiteId: string,
  propertyName: string,
  propertyFilters: PropertyFilter[] = [],
  eventName?: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, timezone } = useDateParameters();
  const params = useFilterParameters({ includePagination: false });

  return useQuery<EventDataNumericStats>({
    queryKey: [
      `websites:${source}-data:numeric-stats`,
      { websiteId, propertyName, eventName, propertyFilters, startAt, endAt, timezone, ...params },
    ],
    queryFn: () =>
      get(
        source === 'event'
          ? `/websites/${websiteId}/event-data-pivot/numeric-stats`
          : `/websites/${websiteId}/session-data/numeric-stats`,
        {
          ...(source === 'event' ? { eventName } : {}),
          propertyName,
          startAt,
          endAt,
          timezone,
          ...serializePropertyFilters(propertyFilters),
          ...params,
        },
      ),
    enabled: !!(websiteId && propertyName && (source === 'session' || eventName)),
    ...options,
  });
}
