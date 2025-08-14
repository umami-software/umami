import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';
import { ReactQueryOptions } from '@/lib/types';

export function useLinksQuery({ teamId }: { teamId?: string }, options?: ReactQueryOptions<any>) {
  const { modified } = useModified('links');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['links', { teamId, modified }],
    queryFn: async () => get(teamId ? `/teams/${teamId}/links` : '/links'),
    ...options,
  });
}
