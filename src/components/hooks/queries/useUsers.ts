'use client';
import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useCache from 'store/cache';

export function useUsers() {
  const { get } = useApi();
  const modified = useCache((state: any) => state?.users);

  return useFilterQuery({
    queryKey: ['users', { modified }],
    queryFn: (params: any) => {
      return get('/admin/users', {
        ...params,
      });
    },
  });
}

export default useUsers;
