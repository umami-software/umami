import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type {
  AttributionParameters,
  AttributionResult,
} from '@/queries/sql/attribution/getAttribution';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function useAttributionQuery(
  params: AnalyticsParameters & Partial<Omit<AttributionParameters, 'startDate' | 'endDate'>>,
  options?: ReactQueryOptions<AttributionResult>,
) {
  return useAnalyticsQuery<AttributionResult>('attribution', params, options);
}
