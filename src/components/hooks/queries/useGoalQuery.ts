import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type {
  GoalBreakdownData,
  GoalChartData,
  GoalParameters,
  GoalResult,
  GoalSummaryData,
} from '@/queries/sql/goals/getGoal';
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

export function useGoalChartQuery(
  { websiteId, id }: { websiteId: string; id: string },
  options?: ReactQueryOptions<GoalChartData[]>,
) {
  return useAnalyticsQuery<GoalChartData[]>(`goals/${id}/chart`, { websiteId }, options);
}

export function useGoalSummaryQuery(
  { websiteId, id }: { websiteId: string; id: string },
  options?: ReactQueryOptions<GoalSummaryData>,
) {
  return useAnalyticsQuery<GoalSummaryData>(`goals/${id}/summary`, { websiteId }, options);
}

export function useGoalBreakdownQuery(
  { websiteId, id, field }: { websiteId: string; id: string; field: string },
  options?: ReactQueryOptions<GoalBreakdownData[]>,
) {
  return useAnalyticsQuery<GoalBreakdownData[]>(
    `goals/${id}/breakdown`,
    { websiteId, field },
    options,
  );
}
