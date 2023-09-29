import { useCallback, useState } from 'react';
import { useApi } from 'components/hooks/useApi';

export function useFilterQuery(key: any[], fn, options?: any) {
  const [params, setParams] = useState({
    query: '',
    page: 1,
  });
  const { useQuery } = useApi();

  const result = useQuery<{
    page: number;
    pageSize: number;
    count: number;
    data: any[];
  }>([...key, params], fn.bind(null, params), options);

  const getProps = useCallback(() => {
    const { data, isLoading, error } = result;
    return { result: data, isLoading, error, params, setParams };
  }, [result, params, setParams]);

  return { ...result, getProps };
}

export default useFilterQuery;
