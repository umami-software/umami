import { UseQueryOptions } from '@tanstack/react-query';
import { useState, Dispatch, SetStateAction } from 'react';
import { useApi } from 'components/hooks/useApi';
import { FilterResult, SearchFilter } from 'lib/types';

export interface FilterQueryResult<T> {
  result: FilterResult<T>;
  query: any;
  params: SearchFilter;
  setParams: Dispatch<SetStateAction<T | SearchFilter>>;
}

export function useFilterQuery<T>({
  queryKey,
  queryFn,
  ...options
}: UseQueryOptions): FilterQueryResult<T> {
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
