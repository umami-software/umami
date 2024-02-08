import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useModified from '../useModified';

export function useUsers() {
  const { get } = useApi();
  const { modified } = useModified(`users`);

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
