import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';
import { ReactQueryOptions } from '@/lib/types';

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
