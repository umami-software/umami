import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataPropertiesQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<any>({
    queryKey: [
      'websites:event-data:properties',
      { websiteId, startAt, endAt, unit, timezone, ...filters },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/properties`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
      }),
    enabled: !!websiteId,
    ...options,
  });
}
