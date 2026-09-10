import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { BreakdownData, BreakdownParameters } from '@/queries/sql/breakdown/getBreakdown';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function useBreakdownQuery(
  params: AnalyticsParameters & Partial<Omit<BreakdownParameters, 'startDate' | 'endDate'>>,
  options?: ReactQueryOptions<BreakdownData[]>,
) {
  return useAnalyticsQuery<BreakdownData[]>('breakdown', params, options);
}
