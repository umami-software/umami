import { UseQueryOptions } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';

export function useEventDataValues(
  websiteId: string,
  eventName: string,
  propertyName: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
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

export default useEventDataValues;
