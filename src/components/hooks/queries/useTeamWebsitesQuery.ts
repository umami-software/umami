import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';

export function useTeamWebsitesQuery(teamId: string) {
  const { get } = useApi();
  const { modified } = useModified(`websites`);

  return usePagedQuery({
    queryKey: ['teams:websites', { teamId, modified }],
    queryFn: (params: any) => {
      return get(`/teams/${teamId}/websites`, params);
    },
  });
}
