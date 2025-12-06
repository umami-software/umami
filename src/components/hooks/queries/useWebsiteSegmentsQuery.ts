import { keepPreviousData } from '@tanstack/react-query';
import { useFilterParameters } from '@/components/hooks/useFilterParameters';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useWebsiteSegmentsQuery(
  websiteId: string,
  params?: Record<string, string>,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`segments`);
  const filters = useFilterParameters();

  return useQuery({
    queryKey: ['website:segments', { websiteId, modified, ...filters, ...params }],
    queryFn: pageParams =>
      get(`/websites/${websiteId}/segments`, { ...pageParams, ...filters, ...params }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
