import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useUserTeamsQuery(userId: string) {
  const { get } = useApi();
  const { modified } = useModified(`teams`);

  return usePagedQuery({
    queryKey: ['teams', { userId, modified }],
    queryFn: params => {
      return get(`/users/${userId}/teams`, params);
    },
    enabled: !!userId,
  });
}
