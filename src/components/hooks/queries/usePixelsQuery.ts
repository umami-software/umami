import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function usePixelsQuery(
  { teamId }: { teamId?: string },
  params?: Record<string, any>,
  options?: ReactQueryOptions,
) {
  const { modified } = useModified('pixels');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['pixels', { teamId, modified, ...params }],
    queryFn: pageParams => {
      return get(teamId ? `/teams/${teamId}/pixels` : '/pixels', {
        ...pageParams,
        ...params,
      });
    },
    ...options,
  });
}
