import { serializePropertyFilters } from '@/lib/params';
import type { PropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import type { PropertyDataSource } from './usePropertyFieldsQuery';

export function usePropertyNumericSeriesQuery(
  source: PropertyDataSource,
  websiteId: string,
  propertyName: string,
  metric: 'sum' | 'avg' | 'count',
  propertyFilters: PropertyFilter[] = [],
  eventName?: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters({ includePagination: false });

  return useQuery<any>({
    queryKey: [
      `websites:${source}-data:numeric-series`,
      { websiteId, propertyName, metric, eventName, propertyFilters, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(
        source === 'event'
          ? `/websites/${websiteId}/event-data-pivot/numeric-series`
          : `/websites/${websiteId}/session-data/numeric-series`,
        {
          ...(source === 'event' ? { eventName } : {}),
          propertyName,
          metric,
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
