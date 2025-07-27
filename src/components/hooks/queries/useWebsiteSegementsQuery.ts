import { useApi } from '../useApi';
import { useModified } from '@/components/hooks';
import { keepPreviousData } from '@tanstack/react-query';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteSegmentsQuery(
  websiteId: string,
  params?: Record<string, string>,
  options?: ReactQueryOptions<any>,
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`website:${websiteId}`);

  return useQuery({
    queryKey: ['website:segments', { websiteId, modified, ...params }],
    queryFn: () => get(`/websites/${websiteId}/segments`, { ...params }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
