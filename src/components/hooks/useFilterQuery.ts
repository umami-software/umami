import { useState } from 'react';
import { useApi } from 'components/hooks/useApi';
import { UseQueryOptions } from '@tanstack/react-query';

export function useFilterQuery(key: any[], fn, options?: UseQueryOptions) {
  const [params, setParams] = useState({
    query: '',
    page: 1,
  });
  const { useQuery } = useApi();

  const { data, ...other } = useQuery([...key, params], fn.bind(null, params), options);

  return {
    result: data as {
      page: number;
      pageSize: number;
      count: number;
      data: any[];
    },
    ...other,
    params,
    setParams,
  };
}

export default useFilterQuery;
