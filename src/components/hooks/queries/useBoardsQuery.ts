import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useBoardsQuery({ teamId }: { teamId?: string }, options?: ReactQueryOptions) {
  const { modified } = useModified('boards');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['boards', { teamId, modified }],
    queryFn: pageParams => {
      return get(teamId ? `/teams/${teamId}/boards` : '/boards', pageParams);
    },
    ...options,
  });
}
