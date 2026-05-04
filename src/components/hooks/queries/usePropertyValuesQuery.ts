import { serializePropertyFilters } from '@/lib/params';
import type { PropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import type { PropertyDataSource } from './usePropertyFieldsQuery';

export function usePropertyValuesQuery(
  source: PropertyDataSource,
  websiteId: string,
  propertyName: string,
  dataType?: number,
  propertyFilters: PropertyFilter[] = [],
  eventName?: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters({ includePagination: false });

  return useQuery<any>({
    queryKey: [
      `websites:${source}-data:values`,
      { websiteId, propertyName, dataType, eventName, propertyFilters, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(
        source === 'event'
          ? `/websites/${websiteId}/event-data/values`
          : `/websites/${websiteId}/session-data/values`,
        {
          ...(source === 'event' ? { event: eventName } : {}),
          startAt,
          endAt,
          unit,
          timezone,
          propertyName,
          dataType,
          ...serializePropertyFilters(propertyFilters),
          ...params,
        },
      ),
    enabled: !!(websiteId && propertyName && (source === 'session' || eventName)),
    ...options,
  });
}
