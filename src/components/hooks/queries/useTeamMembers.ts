import useApi from './useApi';
import useFilterQuery from './useFilterQuery';

export function useTeamMembers(teamId: string) {
  const { get } = useApi();

  return useFilterQuery({
    queryKey: ['teams:users', { teamId }],
    queryFn: (params: any) => {
      return get(`/teams/${teamId}/users`, params);
    },
    enabled: !!teamId,
  });
}

export default useTeamMembers;
