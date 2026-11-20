import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type {
  FunnelBreakdownData,
  FunnelChartData,
  FunnelParameters,
  FunnelResult,
  FunnelTimesData,
} from '@/queries/sql/funnels/getFunnel';
import { useAnalyticsQuery } from './useAnalyticsQuery';

export function useFunnelQuery(
  params: AnalyticsParameters &
    Partial<Omit<FunnelParameters, 'startDate' | 'endDate'>> & { id?: string },
  options?: ReactQueryOptions<FunnelResult[]>,
) {
  return useAnalyticsQuery<FunnelResult[]>(
    params.id ? `funnels/${params.id}/stats` : 'funnels/stats',
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

export function useFunnelChartQuery(
  { websiteId, id }: { websiteId: string; id: string },
  options?: ReactQueryOptions<FunnelChartData[]>,
) {
  return useAnalyticsQuery<FunnelChartData[]>(`funnels/${id}/chart`, { websiteId }, options);
}

export function useFunnelTimesQuery(
  { websiteId, id }: { websiteId: string; id: string },
  options?: ReactQueryOptions<FunnelTimesData>,
) {
  return useAnalyticsQuery<FunnelTimesData>(`funnels/${id}/times`, { websiteId }, options);
}

export function useFunnelBreakdownQuery(
  { websiteId, id, field }: { websiteId: string; id: string; field: string },
  options?: ReactQueryOptions<FunnelBreakdownData[]>,
) {
  return useAnalyticsQuery<FunnelBreakdownData[]>(
    `funnels/${id}/breakdown`,
    { websiteId, field },
    options,
  );
}
