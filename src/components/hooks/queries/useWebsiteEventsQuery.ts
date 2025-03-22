import { useApi } from '../useApi';
import { UseQueryOptions } from '@tanstack/react-query';
import { useFilterParams } from '../useFilterParams';
import { usePagedQuery } from '../usePagedQuery';

export function useWebsiteEventsQuery(
  websiteId: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get } = useApi();
  const params = useFilterParams(websiteId);

  return usePagedQuery({
    queryKey: ['websites:events', { websiteId, ...params }],
    queryFn: pageParams =>
      get(`/websites/${websiteId}/events`, { ...params, ...pageParams, pageSize: 20 }),
    enabled: !!websiteId,
    ...options,
  });
}
