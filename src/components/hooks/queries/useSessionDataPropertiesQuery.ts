import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export function useSessionDataPropertiesQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();

  return useQuery<any>({
    queryKey: ['websites:session-data:properties', { websiteId, ...date, ...filters }],
    queryFn: () => get(`/websites/${websiteId}/session-data/properties`, { ...date, ...filters }),
    enabled: !!websiteId,
    ...options,
  });
}
