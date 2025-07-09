import { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useApi } from './useApi';
import { useNavigation } from './useNavigation';
import { PageResult } from '@/lib/types';

export function usePagedQuery<TData = any, TError = Error>({
  queryKey,
  queryFn,
  ...options
}: Omit<
  UseQueryOptions<PageResult<TData>, TError, PageResult<TData>, readonly unknown[]>,
  'queryFn' | 'queryKey'
> & {
  queryKey: readonly unknown[];
  queryFn: (params?: object) => Promise<PageResult<TData>> | PageResult<TData>;
}): UseQueryResult<PageResult<TData>, TError> {
  const {
    query: { page, search },
  } = useNavigation();
  const { useQuery } = useApi();

  return useQuery<PageResult<TData>, TError>({
    queryKey: [...queryKey, page, search] as const,
    queryFn: () => queryFn({ page, search }),
    ...options,
  });
}
