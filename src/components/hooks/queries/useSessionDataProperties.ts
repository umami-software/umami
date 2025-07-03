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
    queryKey: ['websites:session-data:properties', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/session-data/properties`, { ...params }, { headers: { 'CF-Access-Client-Id': '571942449727ad914a422562e7931a4a.access', 'CF-Access-Client-Secret': '571942449727ad914a422562e7931a4a.secret' } }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useSessionDataProperties;
