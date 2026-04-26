import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataFieldsQuery(
  websiteId: string,
  eventName?: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const params = useFilterParameters();

  return useQuery<any>({
    queryKey: [
      'websites:event-data:fields',
      { websiteId, eventName, startAt, endAt, unit, timezone, ...params },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/fields`, {
        event: eventName,
        startAt,
        endAt,
        unit,
        timezone,
        ...params,
      }),
    enabled: !!websiteId,
    ...options,
  });
}
