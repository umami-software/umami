import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useWebsiteAlertsQuery(websiteId: string, options?: ReactQueryOptions) {
  const { get, useQuery } = useApi();
  const { modified } = useModified('alerts');

  return useQuery({
    queryKey: ['website:alerts', { websiteId, modified }],
    queryFn: () => get(`/websites/${websiteId}/alerts`),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
