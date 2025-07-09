import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '@/components/hooks';
import { ReactQueryOptions } from '@/lib/types';

export function useTeamsQuery(params?: Record<string, any>, options?: ReactQueryOptions) {
  const { get } = useApi();
  const { modified } = useModified(`teams`);

  return usePagedQuery({
    queryKey: ['websites', { modified, ...params }],
    queryFn: pageParams => {
      return get(`/admin/teams`, {
        ...params,
        ...pageParams,
      });
    },
    ...options,
  });
}
