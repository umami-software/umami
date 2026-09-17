import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useAnalyticsQuery } from './useAnalyticsQuery';
export type UTMMetricsData = { utm: string; views: number }[];
export function useUTMMetricsQuery(
  params: AnalyticsParameters & { type: string },
  options?: ReactQueryOptions<UTMMetricsData>,
) {
  return useAnalyticsQuery<UTMMetricsData>('utm/metrics', params, options);
}
