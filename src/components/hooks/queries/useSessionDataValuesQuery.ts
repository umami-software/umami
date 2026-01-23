import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export function useSessionDataValuesQuery(
  websiteId: string,
  propertyName: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, unit, timezone } = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<any>({
    queryKey: [
      'websites:session-data:values',
      { websiteId, propertyName, startAt, endAt, unit, timezone, ...filters },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/session-data/values`, {
        startAt,
        endAt,
        unit,
        timezone,
        ...filters,
        propertyName,
      }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}
