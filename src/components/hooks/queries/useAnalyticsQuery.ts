import { type AnalyticsParameters, serializeAnalyticsQuery } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import { useModified } from '../useModified';
import { useTimezone } from '../useTimezone';

export function useAnalyticsQuery<T>(
  path: string,
  params: AnalyticsParameters & Record<string, any>,
  options?: ReactQueryOptions<T>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, timezone, unit } = useDateParameters();
  const { toUtc } = useTimezone();
  const filters = useFilterParameters({ includePagination: false });
  const { modified } = useModified(`websites:${path.split('/')[0]}`);
  const { startDate, endDate, ...rest } = params;
  const query = serializeAnalyticsQuery({
    startAt,
    endAt,
    timezone,
    unit,
    ...filters,
    ...Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined)),
    // Dates arrive as profile-timezone wall-clock times, as useDateRange({ timezone }) returns them.
    ...(startDate != null && { startDate: toUtc(startDate) }),
    ...(endDate != null && { endDate: toUtc(endDate) }),
  });
  return useQuery<T>({
    queryKey: [`websites:${path}`, { websiteId: params.websiteId, ...query, modified }],
    queryFn: () => get(`/websites/${params.websiteId}/${path}`, query),
    enabled: !!params.websiteId,
    ...options,
  });
}
