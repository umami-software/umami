import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataPropertySeriesQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery<any>({
    queryKey: [
      'websites:event-data-pivot:property-series',
      { websiteId, eventName, propertyName, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data-pivot/property-series`, {
        eventName,
        propertyName,
        startAt,
        endAt,
        unit,
        timezone,
        ...params,
      }),
    enabled: !!(websiteId && eventName && propertyName),
    ...options,
  });
}
