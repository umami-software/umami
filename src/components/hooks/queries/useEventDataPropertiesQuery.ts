import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export function useEventDataPropertiesQuery(websiteId: string, options?: ReactQueryOptions<any>) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery<any>({
    queryKey: ['websites:event-data:properties', { websiteId, ...params }],
    queryFn: () => get(`/websites/${websiteId}/event-data/properties`, { ...params }),
    enabled: !!websiteId,
    ...options,
  });
}
