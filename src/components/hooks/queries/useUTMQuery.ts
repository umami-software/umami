import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { UseQueryOptions } from '@tanstack/react-query';

export function useUTMQuery(
  websiteId: string,
  queryParams?: { type: string; limit?: number; search?: string; startAt?: number; endAt?: number },
  options?: Omit<UseQueryOptions & { onDataLoad?: (data: any) => void }, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();
  const filterParams = useFilterParams(websiteId);

  return useQuery({
    queryKey: ['utm', websiteId, { ...filterParams, ...queryParams }],
    queryFn: () =>
      get(`/websites/${websiteId}/utm`, { websiteId, ...filterParams, ...queryParams }),
    enabled: !!websiteId,
    ...options,
  });
}
