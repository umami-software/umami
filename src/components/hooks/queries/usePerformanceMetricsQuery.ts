import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { PerformanceMetricsData } from '@/queries/sql/performance/getPerformanceMetrics';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function usePerformanceMetricsQuery(
  params: AnalyticsParameters & { metric: string } & {
    type: 'path' | 'title' | 'device' | 'browser';
  },
  options?: ReactQueryOptions<PerformanceMetricsData[]>,
) {
  return useAnalyticsQuery<PerformanceMetricsData[]>('performance/metrics', params, options);
}
