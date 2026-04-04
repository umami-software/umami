import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useWebsitesQuery(params?: Record<string, any>, options?: ReactQueryOptions) {
  const { get } = useApi();
  const { modified } = useModified(`websites`);

  return usePagedQuery({
    queryKey: ['websites:admin', { modified, ...params }],
    queryFn: pageParams => {
      return get(`/admin/websites`, {
        ...pageParams,
        ...params,
      });
    },
    ...options,
  });
}
