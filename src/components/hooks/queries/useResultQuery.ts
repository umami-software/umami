import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { ReactQueryOptions } from '@/lib/types';

export function useResultQuery<T>(
  type: string,
  params?: { [key: string]: any },
  options?: ReactQueryOptions<T>,
) {
  const { websiteId } = params;
  const { post, useQuery } = useApi();
  const filterParams = useFilterParams(websiteId);

  return useQuery<T>({
    queryKey: [
      'reports',
      {
        type,
        websiteId,
        ...filterParams,
        ...params,
      },
    ],
    queryFn: () => post(`/reports/${type}`, { type, ...filterParams, ...params }),
    enabled: !!type,
    ...options,
  });
}
