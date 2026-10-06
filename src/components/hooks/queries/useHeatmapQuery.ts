import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { HeatmapParameters, HeatmapResult } from '@/queries/sql/heatmap/getHeatmap';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function useHeatmapQuery(
  params: AnalyticsParameters & Partial<Omit<HeatmapParameters, 'startDate' | 'endDate'>>,
  options?: ReactQueryOptions<HeatmapResult>,
) {
  return useAnalyticsQuery<HeatmapResult>('heatmaps', params, options);
}
