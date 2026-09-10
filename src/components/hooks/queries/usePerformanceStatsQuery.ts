import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { PerformanceResult } from '@/queries/sql/performance/getPerformance';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function usePerformanceStatsQuery(
  params: AnalyticsParameters,
  options?: ReactQueryOptions<PerformanceResult['summary']>,
) {
  return useAnalyticsQuery<PerformanceResult['summary']>('performance/stats', params, options);
}
