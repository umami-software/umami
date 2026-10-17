import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type {
  FeatureAdoptionParameters,
  FeatureAdoptionResult,
} from '@/queries/sql/features/getFeatureAdoption';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function useFeatureAdoptionQuery(
  params: AnalyticsParameters &
    Partial<Omit<FeatureAdoptionParameters, 'startDate' | 'endDate'>> & { feature: string },
  options?: ReactQueryOptions<FeatureAdoptionResult>,
) {
  return useAnalyticsQuery<FeatureAdoptionResult>('feature-adoption', params, options);
}
