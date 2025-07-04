import { useApi } from '../useApi';
import { useFilterParameters } from '../useFilterParameters';
import { useDateParameters } from '../useDateParameters';
import { ReactQueryOptions } from '@/lib/types';

export function useSessionDataValuesQuery(
  websiteId: string,
  propertyName: string,
  options?: ReactQueryOptions<any>,
) {
  const { get, useQuery } = useApi();
  const date = useDateParameters(websiteId);
  const filters = useFilterParameters();

  return useQuery<any>({
    queryKey: ['websites:session-data:values', { websiteId, propertyName, ...date, ...filters }],
    queryFn: () =>
      get(`/websites/${websiteId}/session-data/values`, { ...date, ...filters, propertyName }),
    enabled: !!(websiteId && propertyName),
    ...options,
  });
}
