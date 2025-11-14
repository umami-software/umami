import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export function useEventDataQuery(websiteId: string, eventId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery({
    queryKey: [
      'websites:event-data',
      { websiteId, eventId, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/${eventId}`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...params,
      }),
    enabled: !!(websiteId && eventId),
    ...options,
  });
}
