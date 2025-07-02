import { UseQueryOptions } from '@tanstack/react-query';
import { useState } from 'react';
import { useApi } from './useApi';
import { useNavigation } from './useNavigation';

export function usePagedQuery({
  queryKey,
  queryFn,
  ...options
}: Omit<UseQueryOptions, 'queryFn'> & { queryFn: (params?: object) => any }) {
  const { query: queryParams } = useNavigation();
  const [params, setParams] = useState({
    search: queryParams?.search ?? '',
    page: queryParams?.page ?? '1',
  });

  const { useQuery } = useApi();

  return {
    ...useQuery({
      queryKey: [{ ...queryKey, ...params }],
      queryFn: () => queryFn(params),
      ...options,
    }),
    params,
    setParams,
  };
}
