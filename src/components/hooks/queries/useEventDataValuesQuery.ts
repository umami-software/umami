import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useEventDataValuesQuery(
  websiteId: string,
  event: string,
  propertyName: string,
  dataType?: number,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<any>({
    queryKey: [
      'websites:event-data:values',
      { websiteId, startAt, endAt, unit, timezone, ...filters, event, propertyName, dataType },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/values`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        event,
        propertyName,
        dataType,
      }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}
