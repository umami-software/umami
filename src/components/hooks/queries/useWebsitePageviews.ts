import { UseQueryOptions } from '@tanstack/react-query';
import { useApi } from './useApi';
import { useFilterParams } from '..//useFilterParams';

export function useWebsitePageviews(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:pageviews', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/pageviews`, params),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsitePageviews;
