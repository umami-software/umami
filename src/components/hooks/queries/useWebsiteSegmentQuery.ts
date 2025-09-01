import { useApi } from '../useApi';
import { useModified } from '../useModified';
import { keepPreviousData } from '@tanstack/react-query';
import { ReactQueryOptions } from '@/lib/types';

export function useWebsiteSegmentQuery(
  websiteId: string,
  segmentId: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`segments`);

  return useQuery({
    queryKey: ['website:segments', { websiteId, segmentId, modified }],
    queryFn: () => get(`/websites/${websiteId}/segments/${segmentId}`),
    enabled: !!(websiteId && segmentId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
