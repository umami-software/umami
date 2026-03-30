import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function useLinkSharesQuery(
  { linkId }: { linkId: string },
  options?: ReactQueryOptions,
) {
  const { modified } = useModified('shares');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['linkShares', { linkId, modified }],
    queryFn: pageParams => {
      return get(`/links/${linkId}/shares`, pageParams);
    },
    ...options,
  });
}
