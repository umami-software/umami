import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export function useResultQuery<T = any>(
  type: string,
  params?: { [key: string]: any },
  options?: ReactQueryOptions<T>,
) {
  const { websiteId } = params;
  const { post, useQuery } = useApi();
  const filters = useFilterParams(websiteId);

  return useQuery<T>({
    queryKey: [
      'reports',
      {
        type,
        websiteId,
        ...filters,
        ...params,
      },
    ],
    queryFn: () => post(`/reports/${type}`, { type, ...filters, ...params }),
    enabled: !!type,
    ...options,
  });
}
