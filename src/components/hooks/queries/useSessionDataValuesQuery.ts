import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export function useSessionDataValuesQuery(
  websiteId: string,
  propertyName: string,
  options?: ReactQueryOptions<any>,
) {
  const { get, useQuery } = useApi();
  const params = useFilterParams(websiteId);

  return useQuery<any>({
    queryKey: ['websites:session-data:values', { websiteId, propertyName, ...params }],
    queryFn: () => get(`/websites/${websiteId}/session-data/values`, { ...params, propertyName }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}
