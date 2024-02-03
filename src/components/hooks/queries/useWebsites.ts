import useApi from './useApi';
import useFilterQuery from './useFilterQuery';
import useCache from 'store/cache';

export function useWebsites(
  { userId, teamId }: { userId?: string; teamId?: string },
  params?: { [key: string]: string | number },
) {
  const { get } = useApi();
  const modified = useCache((state: any) => state?.websites);

  return useFilterQuery({
    queryKey: ['websites', { userId, teamId, modified, ...params }],
    queryFn: (data: any) => {
      return get(teamId ? `/teams/${teamId}/websites` : `/users/${userId}/websites`, {
        ...data,
        ...params,
      });
    },
    enabled: !!(userId || teamId),
  });
}

export default useWebsites;
