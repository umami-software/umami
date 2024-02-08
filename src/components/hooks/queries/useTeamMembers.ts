import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useModified from 'store/modified';

export function useTeamMembers(teamId: string) {
  const { get } = useApi();
  const modified = useModified((state: any) => state?.['teams:members']);

  return useFilterQuery({
    queryKey: ['teams:members', { teamId, modified }],
    queryFn: (params: any) => {
      return get(`/teams/${teamId}/users`, params);
    },
    enabled: !!teamId,
  });
}

export default useTeamMembers;
