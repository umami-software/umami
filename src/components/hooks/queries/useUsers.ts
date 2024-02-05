'use client';
import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useModified from 'store/modified';

export function useUsers() {
  const { get } = useApi();
  const modified = useModified((state: any) => state?.users);

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
