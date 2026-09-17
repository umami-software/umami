import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useWebsiteAnnotationsQuery(
  websiteId: string,
  params?: Record<string, string | number>,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`annotations`);

  return useQuery({
    queryKey: ['website:annotations', { websiteId, modified, ...params }],
    queryFn: () => get(`/websites/${websiteId}/annotations`, params),
    enabled: !!websiteId,
    placeholderData: keepPreviousData,
    ...options,
  });
}
