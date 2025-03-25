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
    queryFn: () => get(`/websites/${websiteId}/pageviews`, { ...params, compare }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsitePageviews;
