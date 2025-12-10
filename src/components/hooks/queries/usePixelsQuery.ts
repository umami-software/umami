import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function usePixelsQuery({ teamId }: { teamId?: string }, options?: ReactQueryOptions) {
  const { modified } = useModified('pixels');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['pixels', { teamId, modified }],
    queryFn: pageParams => {
      return get(teamId ? `/teams/${teamId}/pixels` : '/pixels', pageParams);
    },
    ...options,
  });
}
