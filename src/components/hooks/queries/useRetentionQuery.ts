import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { RetentionParameters, RetentionResult } from '@/queries/sql/retention/getRetention';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function useRetentionQuery(
  params: AnalyticsParameters & Partial<Omit<RetentionParameters, 'startDate' | 'endDate'>>,
  options?: ReactQueryOptions<RetentionResult[]>,
) {
  return useAnalyticsQuery<RetentionResult[]>('retention', params, options);
}
