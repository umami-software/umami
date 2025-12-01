import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useModified } from '../useModified';

export function useWebsiteCohortQuery(
  websiteId: string,
  cohortId: string,
  options?: ReactQueryOptions,
) {
  const { get, useQuery } = useApi();
  const { modified } = useModified(`cohorts`);

  return useQuery({
    queryKey: ['website:cohorts', { websiteId, cohortId, modified }],
    queryFn: () => get(`/websites/${websiteId}/segments/${cohortId}`),
    enabled: !!(websiteId && cohortId),
    placeholderData: keepPreviousData,
    ...options,
  });
}
