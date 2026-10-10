import { keepPreviousData } from '@tanstack/react-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';

export interface RevenueChartData {
  chart: { x: string; t: string; y: number; count: number }[];
}

export function useRevenueChartQuery(
  websiteId: string,
  currency: string,
  options?: ReactQueryOptions<RevenueChartData>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, timezone, unit } = useDateParameters();
  const filters = useFilterParameters({ includePagination: false });

  return useQuery<RevenueChartData>({
    queryKey: [
      'websites:revenue:chart',
      {
        websiteId,
        currency,
        startAt,
        endAt,
        timezone,
        unit,
        ...filters,
      },
    ],
    queryFn: async () =>
      get(`/websites/${websiteId}/revenue/chart`, {
        currency,
        startAt,
        endAt,
        timezone,
        unit,
        ...filters,
      }),
    enabled: !!(websiteId && currency),
    placeholderData: keepPreviousData,
    ...options,
  });
}
