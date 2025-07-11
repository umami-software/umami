import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';
import { ReactQueryOptions } from '@/lib/types';

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
