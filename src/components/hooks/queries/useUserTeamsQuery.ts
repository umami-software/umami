import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useUserTeamsQuery(userId: string) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`teams`);

  return useQuery({
    queryKey: ['teams', { userId, modified }],
    queryFn: () => {
      return get(`/users/${userId}/teams`);
    },
    enabled: !!userId,
  });
}
