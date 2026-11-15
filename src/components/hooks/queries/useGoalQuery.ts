import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { GoalParameters, GoalResult } from '@/queries/sql/goals/getGoal';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function useGoalQuery(
  params: AnalyticsParameters &
    Partial<Omit<GoalParameters, 'startDate' | 'endDate'>> & { id?: string },
  options?: ReactQueryOptions<GoalResult>,
) {
  return useAnalyticsQuery<GoalResult>(
    params.id ? `goals/${params.id}/stats` : 'goals/stats',
    params.id
      ? {
          websiteId: params.websiteId,
          startDate: params.startDate,
          endDate: params.endDate,
          unit: params.unit,
          timezone: params.timezone,
        }
      : params,
    options,
  );
}
