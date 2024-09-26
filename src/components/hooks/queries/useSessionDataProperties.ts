import { useApi } from '../useApi';
import { UseQueryOptions } from '@tanstack/react-query';
import { useFilterParams } from '../useFilterParams';

export function useSessionDataProperties(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery<any>({
    queryKey: ['websites:event-data:properties', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/session-data/properties`, { ...params }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useSessionDataProperties;
