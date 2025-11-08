import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';

export function useUsersQuery() {
  const { get } = useApi();
  const { modified } = useModified(`users`);

  return usePagedQuery({
    queryKey: ['users:admin', { modified }],
    queryFn: (pageParams: any) => {
      return get('/admin/users', {
        ...pageParams,
      });
    },
  });
}
