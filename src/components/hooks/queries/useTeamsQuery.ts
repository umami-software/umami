import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useTeamsQuery(userId: string) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`teams`);

  return useQuery({
    queryKey: ['teams', { userId, modified }],
    queryFn: (params: any) => {
      return get(`/users/${userId}/teams`, params);
    },
    enabled: !!userId,
  });
}
