import type { AnalyticsParameters } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import type { FunnelParameters, FunnelResult } from '@/queries/sql/funnels/getFunnel';
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
