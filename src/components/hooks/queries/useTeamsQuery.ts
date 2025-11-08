import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';
import { ReactQueryOptions } from '@/lib/types';

export function useTeamsQuery(params?: Record<string, any>, options?: ReactQueryOptions) {
  const { get } = useApi();
  const { modified } = useModified(`teams`);

  return usePagedQuery({
    queryKey: ['teams:admin', { modified, ...params }],
    queryFn: pageParams => {
      return get(`/admin/teams`, {
        ...pageParams,
        ...params,
      });
    },
    ...options,
  });
}
