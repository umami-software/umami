import { UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';
import { useApi } from './useApi';
import { FilterResult, SearchFilter, FilterQueryResult } from 'lib/types';

export function useFilterQuery<T = any>({
  queryKey,
  queryFn,
  ...options
}: Omit<UseQueryOptions, 'queryFn'> & { queryFn: (params?: object) => any }): FilterQueryResult<T> {
  const [params, setParams] = useState<T | SearchFilter>({
    query: '',
    page: 1,
  });

  const { useQuery } = useApi();
  const { data, ...query } = useQuery({
    queryKey: [{ ...queryKey, ...params }],
    queryFn: () => queryFn(params as any),
    ...options,
  });

  return {
    result: data as FilterResult<any>,
    query,
    params,
    setParams,
  };
}

export default useFilterQuery;
