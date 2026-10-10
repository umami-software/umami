import { MAX_PAGING_RESULTS } from '@/lib/constants';
import { serializeEventPropertyFilters } from '@/lib/params';
import type { EventPropertyFilter, ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataPivotQuery(
  websiteId: string,
  eventName: string,
  eventFilters: EventPropertyFilter[] = [],
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery({
    queryKey: [
      'websites:event-data-pivot',
      { websiteId, eventName, eventFilters, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data-pivot`, {
        eventName,
        startAt,
        endAt,
        unit,
        timezone,
        ...serializeEventPropertyFilters(eventFilters),
        ...params,
        maxResults: MAX_PAGING_RESULTS,
      }),
    enabled: !!(websiteId && eventName),
    ...options,
  });
}
