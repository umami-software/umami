import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useUserWebsitesQuery(
  { userId, teamId }: { userId?: string; teamId?: string },
  params?: Record<string, any>,
  options?: ReactQueryOptions,
) {
  const { get } = useApi();
  const { modified } = useModified(`websites`);

  return usePagedQuery({
    queryKey: ['websites', { userId, teamId, modified, ...params }],
    queryFn: pageParams => {
      return get(
        teamId
          ? `/teams/${teamId}/websites`
          : userId
            ? `/users/${userId}/websites`
            : '/me/websites',
        {
          ...pageParams,
          ...params,
        },
      );
    },
    ...options,
  });
}
