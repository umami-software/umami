import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';
import { ReactQueryOptions } from '@/lib/types';

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
