import useModified from 'store/modified';
import useApi from './useApi';
import useFilterQuery from './useFilterQuery';

export function useTeamMembers(teamId: string) {
  const { get } = useApi();
  const modified = useModified((state: any) => state?.['team:users']);

  return useFilterQuery({
    queryKey: ['teams:users', { teamId, modified }],
    queryFn: (params: any) => {
      return get(`/teams/${teamId}/users`, params);
    },
    enabled: !!teamId,
  });
}

export default useTeamMembers;
