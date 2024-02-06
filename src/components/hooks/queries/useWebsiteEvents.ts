import useApi from './useApi';
import { UseQueryOptions } from '@tanstack/react-query';

export function useWebsiteEvents(
  websiteId: string,
  params?: { [key: string]: any },
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: ['events', { ...params }],
    queryFn: () => get(`/websites/${websiteId}/events`, { ...params }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteEvents;
