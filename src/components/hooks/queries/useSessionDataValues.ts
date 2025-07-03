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
    queryFn: () => get(`/websites/${websiteId}/session-data/values`, { ...params, propertyName }, { headers: { 'CF-Access-Client-Id': '571942449727ad914a422562e7931a4a.access', 'CF-Access-Client-Secret': '571942449727ad914a422562e7931a4a.secret' } }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}

export default useSessionDataValues;
