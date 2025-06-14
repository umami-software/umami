import { useApi } from '@/components/hooks';
import { ReactQueryOptions } from '@/lib/types';

export function useResultQuery<T>(
  type: string,
  params?: { [key: string]: any },
  options?: ReactQueryOptions<T>,
) {
  const { post, useQuery } = useApi();

  return useQuery<T>({
    queryKey: ['reports', type, params],
    queryFn: () => post(`/reports/${type}`, { type, ...params }),
    enabled: !!type,
    ...options,
  });
}
