import { useApi } from '../useApi';
import { ReactQueryOptions } from '@/lib/types';

export function useDateRangeQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  return useQuery<any>({
    queryKey: ['date-range', websiteId],
    queryFn: () => get(`/websites/${websiteId}/daterange`),
    enabled: !!websiteId,
    ...options,
  });
}
