import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useReportsQuery(
  { websiteId, type }: { websiteId: string; type?: string },
  options?: ReactQueryOptions,
) {
  const { modified } = useModified(`reports:${type}`);
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['reports', { websiteId, type, modified }],
    queryFn: async () => get('/reports', { websiteId, type }),
    enabled: !!websiteId && !!type,
    ...options,
  });
}
