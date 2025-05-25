import { useApi } from '../useApi';
import { useFilterParams } from '../useFilterParams';
import { UseQueryOptions } from '@tanstack/react-query';

interface RevenueData {
  chart: any[];
  country: any[];
  total: {
    sum: number;
    count: number;
    unique_count: number;
  };
  table: any[];
}

export function useRevenueQuery(
  websiteId: string,
  queryParams?: { type: string; limit?: number; search?: string; startAt?: number; endAt?: number },
  options?: Omit<
    UseQueryOptions<RevenueData, Error, RevenueData, any[]> & { onDataLoad?: (data: any) => void },
    'queryKey' | 'queryFn'
  >,
) {
  const { get, useQuery } = useApi();
  const filterParams = useFilterParams(websiteId);
  const currency = 'USD';

  return useQuery<RevenueData, Error, RevenueData, any[]>({
    queryKey: ['revenue', websiteId, { ...filterParams, ...queryParams }],
    queryFn: () =>
      get(`/websites/${websiteId}/revenue`, {
        currency,
        ...filterParams,
        ...queryParams,
      }),
    enabled: !!websiteId,
    ...options,
  });
}
