import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { PerformanceResult } from '@/queries/sql/performance/getPerformance';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function usePerformanceChartQuery(
  params: AnalyticsParameters & { metric: string },
  options?: ReactQueryOptions<Pick<PerformanceResult, 'chart'>>,
) {
  return useAnalyticsQuery<Pick<PerformanceResult, 'chart'>>('performance/chart', params, options);
}
