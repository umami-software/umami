import { UseQueryOptions } from '@tanstack/react-query';
import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';

export function useWebsitePageviews(
  websiteId: string,
  compare?: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:pageviews', { websiteId, ...params, compare }],
    queryFn: () => get(`/websites/${websiteId}/pageviews`, { ...params, compare }, { headers: { 'CF-Access-Client-Id': '571942449727ad914a422562e7931a4a.access', 'CF-Access-Client-Secret': '0c64ab363f33606ff815a2d871a5eb1776a3b2ba909a4bd2cdd92017d1ab9d1a' } }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsitePageviews;
