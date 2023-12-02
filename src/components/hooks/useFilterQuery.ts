import { useState, Dispatch, SetStateAction } from 'react';
import { useApi } from 'components/hooks/useApi';
import { SearchFilter, FilterResult } from 'lib/types';

export interface FilterQueryResult<T> {
  result: FilterResult<any[]>;
  query: any;
  params: SearchFilter;
  setParams: Dispatch<SetStateAction<T | SearchFilter>>;
}

export function useFilterQuery<T>(props = {}): FilterQueryResult<T> {
  const [params, setParams] = useState<T | SearchFilter>({
    query: '',
    page: 1,
  });
  const { useQuery } = useApi();
  const { data, ...query } = useQuery<FilterResult<any[]>>({ ...props });

  return {
    result: data,
    query,
    params,
    setParams,
  };
}

export default useFilterQuery;
