import { serializePropertyFilters } from '@/lib/params';
import type { PropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useSessionDataStatsQuery(
  websiteId: string,
  propertyName: string,
  propertyFilters: PropertyFilter[] = [],
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters({ includePagination: false });

  return useQuery({
    queryKey: [
      'websites:session-data:stats',
      { websiteId, propertyName, propertyFilters, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/session-data/stats`, {
        startAt,
        endAt,
        unit,
        timezone,
        propertyName,
        ...serializePropertyFilters(propertyFilters),
        ...params,
      }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}
