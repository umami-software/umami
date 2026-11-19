import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { JourneyParameters, JourneyResult } from '@/queries/sql/journeys/getJourney';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function useJourneyQuery(
  params: AnalyticsParameters &
    Partial<Omit<JourneyParameters, 'startDate' | 'endDate'>> & { eventType?: number },
  options?: ReactQueryOptions<JourneyResult[]>,
) {
  return useAnalyticsQuery<JourneyResult[]>('journeys', params, options);
}
