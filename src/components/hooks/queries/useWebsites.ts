import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useLoginQuery } from './useLoginQuery';
import { useModified } from '../useModified';

export function useWebsites(
  { userId, teamId }: { userId?: string; teamId?: string },
  params?: { [key: string]: string | number },
) {
  const { get } = useApi();
  const { user } = useLoginQuery();
  const { modified } = useModified(`websites`);

  return usePagedQuery({
    queryKey: ['websites', { userId, teamId, modified, ...params }],
    queryFn: (data: any) => {
      return get(teamId ? `/teams/${teamId}/websites` : `/users/${userId || user.id}/websites`, {
        ...data,
        ...params,
      });
    },
  });
}
