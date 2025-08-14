import { useApi } from '../useApi';
import { usePagedQuery } from '../usePagedQuery';
import { useModified } from '../useModified';
import { ReactQueryOptions } from '@/lib/types';

export function usePixelsQuery(
  { websiteId, type }: { websiteId: string; type?: string },
  options?: ReactQueryOptions<any>,
) {
  const { modified } = useModified(`pixels:${type}`);
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['pixels', { websiteId, type, modified }],
    queryFn: async () => get('/pixels', { websiteId, type }),
    enabled: !!websiteId && !!type,
    ...options,
  });
}
