'use client';
import useApi from './useApi';
import useFilterQuery from './useFilterQuery';

export function useTeamWebsites(teamId: string) {
  const { get } = useApi();

  return useFilterQuery({
    queryKey: ['teams:websites', { teamId }],
    queryFn: (params: any) => {
      return get(`/teams/${teamId}/websites`, params);
    },
  });
}

export default useTeamWebsites;
