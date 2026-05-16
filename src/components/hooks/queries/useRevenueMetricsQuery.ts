import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export type RevenueMetricType = 'country' | 'region' | 'referrer' | 'channel';

export type RevenueMetricsData = {
  name: string;
  value: number;
  country?: string;
}[];

export function useRevenueMetricsQuery(
  websiteId: string,
  params: { type: RevenueMetricType; currency: string },
  options?: ReactQueryOptions<RevenueMetricsData>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt } = useDateParameters();
  const filters = useFilterParameters({ includePagination: false });

  return useQuery<RevenueMetricsData>({
    queryKey: [
      'websites:revenue:metrics',
      {
        websiteId,
        startAt,
        endAt,
        ...filters,
        ...params,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/revenue/metrics`, {
        startAt,
        endAt,
        ...filters,
        ...params,
      }),
    enabled: !!(websiteId && params.currency && params.type),
    placeholderData: keepPreviousData,
    ...options,
  });
}
