import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useWebsiteSharesQuery(
  { websiteId }: { websiteId: string },
  options?: ReactQueryOptions,
) {
  const { modified } = useModified('shares');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['websiteShares', { websiteId, modified }],
    queryFn: pageParams => {
      return get(`/websites/${websiteId}/shares`, pageParams);
    },
    ...options,
  });
}
