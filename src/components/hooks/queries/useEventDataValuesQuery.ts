import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export function useEventDataValuesQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const date = useDateParameters();
  const filters = useFilterParameters();

  return useQuery<any>({
    queryKey: [
      'websites:event-data:values',
      { websiteId, eventName, propertyName, ...date, ...filters },
    ],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/values`, {
        ...date,
        ...filters,
        eventName,
        propertyName,
      }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}
