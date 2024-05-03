import useApi from './useApi';
import { useFilterParams } from '../useFilterParams';
import { UseQueryOptions } from '@tanstack/react-query';

export function useWebsiteEvents(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:events', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/events`, params),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteEvents;
