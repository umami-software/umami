import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

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
