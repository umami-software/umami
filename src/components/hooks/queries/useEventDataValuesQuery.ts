import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export function useEventDataValuesQuery(
  websiteId: string,
  eventName: string,
  propertyName: string,
  options?: ReactQueryOptions<any>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery<any>({
    queryKey: ['websites:event-data:values', { websiteId, eventName, propertyName, ...params }],
    queryFn: () =>
      get(`/websites/${websiteId}/event-data/values`, { ...params, eventName, propertyName }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}
