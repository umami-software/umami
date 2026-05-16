import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { usePagedQuery } from '../usePagedQuery';

export function usePixelSharesQuery(
  { pixelId }: { pixelId: string },
  options?: ReactQueryOptions,
) {
  const { modified } = useModified('shares');
  const { get } = useApi();

  return usePagedQuery({
    queryKey: ['pixelShares', { pixelId, modified }],
    queryFn: pageParams => {
      return get(`/pixels/${pixelId}/shares`, pageParams);
    },
    ...options,
  });
}
