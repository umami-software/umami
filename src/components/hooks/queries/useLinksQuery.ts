import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useLinksQuery({ teamId }: { teamId?: string }, options?: ReactQueryOptions) {
  const { modified } = useModified('links');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['links', { teamId, modified }],
    queryFn: pageParams => {
      return get(teamId ? `/teams/${teamId}/links` : '/links', pageParams);
    },
    ...options,
  });
}
