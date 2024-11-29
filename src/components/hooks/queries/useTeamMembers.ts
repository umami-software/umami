import { useApi } from '../useApi';
import usePagedQuery from '../usePagedQuery';
import useModified from '../useModified';

export function useTeamMembers(teamId: string) {
  const { get } = useApi();
  const { modified } = useModified(`teams:members`);

  return usePagedQuery({
    queryKey: ['teams:members', { teamId, modified }],
    queryFn: (params: any) => {
      return get(`/teams/${teamId}/users`, params);
    },
    enabled: !!teamId,
  });
}

export default useTeamMembers;
