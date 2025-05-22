import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { UseQueryOptions } from '@tanstack/react-query';

export function useRetentionQuery(
  websiteId: string,
  queryParams?: { type: string; limit?: number; search?: string; startAt?: number; endAt?: number },
  options?: Omit<UseQueryOptions & { onDataLoad?: (data: any) => void }, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const filterParams = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['retention', websiteId, { ...filterParams, ...queryParams }],
    queryFn: () =>
      get(`/websites/${websiteId}/retention`, { websiteId, ...filterParams, ...queryParams }),
    enabled: !!websiteId,
    ...options,
  });
}
