import { UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';
import { PageResult, PageParams, PagedQueryResult } from 'lib/types';
import { useApi } from './useApi';
import { useNavigation } from './useNavigation';

export function usePagedQuery<T = any>({
  queryKey,
  queryFn,
  ...options
}: Omit<UseQueryOptions, 'queryFn'> & { queryFn: (params?: object) => any }): PagedQueryResult<T> {
  const { query: queryParams } = useNavigation();
  const [params, setParams] = useState<PageParams>({
    query: '',
    page: +queryParams.page || 1,
  });

  const { useQuery } = useApi();
  const { data, ...query } = useQuery({
    queryKey: [{ ...queryKey, ...params }],
    queryFn: () => queryFn(params as any),
    ...options,
  });

  return {
    result: data as PageResult<T>,
    query,
    params,
    setParams,
  };
}

export default usePagedQuery;
