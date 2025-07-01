import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { usePagedQuery } from '../usePagedQuery';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteEventsQuery(websiteId: string, options?: ReactQueryOptions<any>) {
  const { get } = useApi();
  const filterParams = useFilterParams(websiteId);

  return usePagedQuery({
    queryKey: ['websites:events', { websiteId, ...filterParams }],
    queryFn: () => get(`/websites/${websiteId}/events`, { ...filterParams, pageSize: 20 }),
    enabled: !!websiteId,
    ...options,
  });
}
