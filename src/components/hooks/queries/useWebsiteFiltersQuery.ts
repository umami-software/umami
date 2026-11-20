import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useWebsiteFiltersQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified('filterRules');

  return useQuery({
    queryKey: ['website:filters', { websiteId, modified }],
    queryFn: () => get(`/websites/${websiteId}/filters`),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
