import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { usePagedQuery } from '../usePagedQuery';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteEventsQuery(websiteId: string, options?: ReactQueryOptions<any>) {
  const { get } = useApi();
  const queryParams = useFilterParams(websiteId);

  return usePagedQuery({
    queryKey: ['websites:events', { websiteId, ...queryParams }],
    queryFn: () => get(`/websites/${websiteId}/events`, { ...queryParams, pageSize: 20 }),
    enabled: !!websiteId,
    ...options,
  });
}
