import { useApi } from '../useApi';
import { UseQueryOptions } from '@tanstack/react-query';
import { useFilterParams } from '../useFilterParams';

export function useSessionDataValues(
  websiteId: string,
  propertyName: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery<any>({
    queryKey: ['websites:session-data:values', { websiteId, propertyName, ...params }],
    queryFn: () => get(`/websites/${websiteId}/session-data/values`, { ...params, propertyName }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}

export default useSessionDataValues;
