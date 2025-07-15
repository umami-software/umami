import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { usePagedQuery } from '../usePagedQuery';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteEventsQuery(
  websiteId: string,
  params?: Record<string, any>,
  options?: ReactQueryOptions<any>,
) {
  const { get } = useApi();
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: ['websites:events', { websiteId, ...date, ...filters, ...params }],
    queryFn: pageParams =>
      get(`/websites/${websiteId}/events`, {
        ...date,
        ...filters,
        ...pageParams,
        ...params,
      }),
    enabled: !!websiteId,
    ...options,
  });
}
