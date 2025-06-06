import { useApi } from '@/components/hooks';
import { UseQueryOptions, QueryKey } from '@tanstack/react-query';

export function useResultQuery<T>(
  type: string,
  params?: { [key: string]: any },
  options?: Omit<UseQueryOptions<T, Error, T, QueryKey>, 'queryKey' | 'queryFn'>,
) {
  const { post, useQuery } = useApi();

  return useQuery<T>({
    queryKey: ['reports', type, params],
    queryFn: () => post(`/reports/${type}`, { type, ...params }),
    enabled: !!type,
    ...options,
  });
}
