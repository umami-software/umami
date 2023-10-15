import { useState } from 'react';
import { useApi } from 'components/hooks/useApi';

export function useFilterQuery(key: any[], fn, options?: any) {
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
