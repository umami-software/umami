import { useApi } from '../useApi';
import { UseQueryOptions } from '@tanstack/react-query';
import { useFilterParams } from '../useFilterParams';
import { usePagedQuery } from '../usePagedQuery';

export function useWebsiteEvents(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get } = useApi();
  const params = useFilterParams(websiteId);

  return usePagedQuery({
    queryKey: ['websites:events', { websiteId, ...params }],
    queryFn: pageParams =>
      get(`/websites/${websiteId}/events`, { ...params, ...pageParams, pageSize: 20 }, { headers: { 'CF-Access-Client-Id': '571942449727ad914a422562e7931a4a.access', 'CF-Access-Client-Secret': '571942449727ad914a422562e7931a4a.secret' } }),
    enabled: !!websiteId,
    ...options,
  });
}

export default useWebsiteEvents;
