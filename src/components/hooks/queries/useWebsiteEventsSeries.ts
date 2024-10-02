import useApi from './useApi';
import { UseQueryOptions } from '@tanstack/react-query';
import { useFilterParams } from '../useFilterParams';

export function useWebsiteEventsSeries(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['websites:events:series', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/events/series`, { ...params }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteEventsSeries;
