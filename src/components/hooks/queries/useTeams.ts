import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import useModified from '../useModified';

export function useTeams(userId: string) {
  const { get } = useApi();
  const { modified } = useModified(`teams`);

  return usePagedQuery({
    queryKey: ['teams', { userId, modified }],
    queryFn: (params: any) => {
      return get(`/users/${userId}/teams`, params);
    },
  });
}

export default useTeams;
