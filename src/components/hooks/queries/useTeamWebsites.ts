import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useModified from 'store/modified';

export function useTeamWebsites(teamId: string) {
  const { get } = useApi();
  const modified = useModified((state: any) => state?.['teams:websites']);

  return useFilterQuery({
    queryKey: ['teams:websites', { teamId, modified }],
    queryFn: (params: any) => {
      return get(`/teams/${teamId}/websites`, params);
    },
  });
}

export default useTeamWebsites;
