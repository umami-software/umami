import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useWebsiteQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`website:${websiteId}`);

  return useQuery({
    queryKey: ['website', { websiteId, modified }],
    queryFn: () => get(`/websites/${websiteId}`),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
