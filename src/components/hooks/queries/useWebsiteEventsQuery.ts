import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { usePagedQuery } from '../usePagedQuery';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteEventsQuery(websiteId: string, options?: ReactQueryOptions<any>) {
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
