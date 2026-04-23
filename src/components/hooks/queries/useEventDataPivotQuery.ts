import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataPivotQuery(
  websiteId: string,
  eventName: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery({
    queryKey: [
      'websites:event-data-pivot',
      { websiteId, eventName, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data-pivot`, {
        eventName,
        startAt,
        endAt,
        unit,
        timezone,
        ...params,
      }),
    enabled: !!(websiteId && eventName),
    ...options,
  });
}
