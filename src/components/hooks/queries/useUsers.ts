import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import useModified from '../useModified';

export function useUsers() {
  const { get } = useApi();
  const { modified } = useModified(`users`);

  return usePagedQuery({
    queryKey: ['users', { modified }],
    queryFn: (params: any) => {
      return get('/admin/users', {
        ...params,
      });
    },
  });
}

export default useUsers;
