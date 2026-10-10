import { keepPreviousData } from '@tanstack/react-query';
import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { PerformanceResult } from '@/queries/sql/performance/getPerformance';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function usePerformanceChartQuery(
  params: AnalyticsParameters & { metric: string },
  options?: ReactQueryOptions<Pick<PerformanceResult, 'chart'>>,
) {
  // Keep the last metric's data on screen while a newly selected metric loads.
  return useAnalyticsQuery<Pick<PerformanceResult, 'chart'>>('performance/chart', params, {
    placeholderData: keepPreviousData,
    ...options,
  });
}
