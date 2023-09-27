import { useState } from 'react';
import { useApi } from 'components/hooks/useApi';

export function useFilterQuery(key, fn, options) {
  const [params, setParams] = useState({
    query: '',
    page: 1,
  });
  const { useQuery } = useApi();

  const result = useQuery([...key, params], fn.bind(null, params), options);

  return { ...result, params, setParams };
}

export default useFilterQuery;
