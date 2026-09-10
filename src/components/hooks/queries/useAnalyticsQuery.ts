import { type AnalyticsParameters, serializeAnalyticsQuery } from '@/lib/analytics-query';
import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useFilterParameters } from '../useFilterParameters';
import { useModified } from '../useModified';

export function useAnalyticsQuery<T>(
  path: string,
  params: AnalyticsParameters & Record<string, any>,
  options?: ReactQueryOptions<T>,
) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, timezone, unit } = useDateParameters();
  const filters = useFilterParameters({ includePagination: false });
  const { modified } = useModified(`websites:${path.split('/')[0]}`);
  const query = serializeAnalyticsQuery({
    startAt,
    endAt,
    timezone,
    unit,
    ...filters,
    ...Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined)),
  });
  return useQuery<T>({
    queryKey: [`websites:${path}`, { websiteId: params.websiteId, ...query, modified }],
    queryFn: () => get(`/websites/${params.websiteId}/${path}`, query),
    enabled: !!params.websiteId,
    ...options,
  });
}
