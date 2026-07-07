import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useWebsiteGroupsQuery(
  { teamId }: { teamId?: string },
  params?: Record<string, any>,
  options?: ReactQueryOptions,
) {
  const { get } = useApi();
  const { modified } = useModified('website-groups');

  return usePagedQuery({
    queryKey: ['website-groups', { teamId, modified, ...params }],
    queryFn: pageParams => {
      return get('/website-groups', {
        ...pageParams,
        ...params,
        ...(teamId ? { teamId } : {}),
      });
    },
    ...options,
  });
}
