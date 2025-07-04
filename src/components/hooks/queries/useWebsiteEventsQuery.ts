import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { usePagedQuery } from '../usePagedQuery';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteEventsQuery(websiteId: string, options?: ReactQueryOptions<any>) {
  const { get } = useApi();
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();

  return usePagedQuery({
    queryKey: ['websites:events', { websiteId, ...date, ...filters }],
    queryFn: () => get(`/websites/${websiteId}/events`, { ...date, ...filters, pageSize: 20 }),
    enabled: !!websiteId,
    ...options,
  });
}
