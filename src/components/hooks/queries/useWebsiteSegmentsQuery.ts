import { useApi } from '../useApi';
import { useModified } from '@/components/hooks';
import { keepPreviousData } from '@tanstack/react-query';
import { ReactQueryOptions } from '@/lib/types';
import { useFilterParameters } from '@/components/hooks/useFilterParameters';

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
    queryFn: () => get(`/websites/${websiteId}/segments`, { ...filters, ...params }),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
