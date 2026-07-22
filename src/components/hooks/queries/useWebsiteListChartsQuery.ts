import { useMemo } from 'react';
import type { WebsiteListChartData } from '@/queries/sql/getWebsiteListCharts';
import { useApi } from '../useApi';
import { useTimezone } from '../useTimezone';

export interface WebsiteListChartsResponse {
  data: Record<string, WebsiteListChartData>;
}

function useListChartsQuery(queryKey: string, path: string, idsInput: string[]) {
  const { get, useQuery } = useApi();
  const { timezone, canonicalizeTimezone } = useTimezone();

  const ids = useMemo(
    () => Array.from(new Set(idsInput.map(id => id?.trim()).filter(Boolean))).sort(),
    [idsInput],
  );
  const resolvedTimezone = canonicalizeTimezone(timezone);

  return useQuery<WebsiteListChartsResponse>({
    queryKey: [queryKey, { ids, timezone: resolvedTimezone }],
    queryFn: () =>
      get(path, {
        ids: ids.join(','),
        timezone: resolvedTimezone,
      }),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWebsiteListChartsQuery(websiteIds: string[]) {
  return useListChartsQuery('websites:list:charts', '/websites/charts', websiteIds);
}

export function useLinkListChartsQuery(linkIds: string[]) {
  return useListChartsQuery('links:list:charts', '/links/charts', linkIds);
}

export function usePixelListChartsQuery(pixelIds: string[]) {
  return useListChartsQuery('pixels:list:charts', '/pixels/charts', pixelIds);
}
