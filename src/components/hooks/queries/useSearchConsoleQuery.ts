import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { httpGet } from '@/lib/fetch';

export type SearchConsoleDimension = 'query' | 'page' | 'country' | 'device' | 'date';

export interface SearchConsoleRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleData {
  dimension: SearchConsoleDimension;
  rows: SearchConsoleRow[];
}

export interface SearchConsoleError extends Error {
  status?: number;
  code?: string;
}

// Search Console is a Cloud integration: the data is read live from Google by the Cloud app,
// which serves the dashboard on the same origin and authenticates the request with its session.
function getQueryUrl() {
  const base =
    process.env.cloudUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  return `${base.replace(/\/+$/, '')}/api/integrations/google-search-console/query`;
}

export function useSearchConsoleQuery(
  {
    websiteId,
    startDate,
    endDate,
    dimension,
    limit = 10,
  }: {
    websiteId: string;
    startDate: Date;
    endDate: Date;
    dimension: SearchConsoleDimension;
    limit?: number;
  },
  options?: { enabled?: boolean },
) {
  // Google reports whole days, so the range is sent as calendar dates in the viewer's timezone.
  const start = format(startDate, 'yyyy-MM-dd');
  const end = format(endDate, 'yyyy-MM-dd');

  return useQuery<SearchConsoleData, SearchConsoleError>({
    queryKey: ['search-console', { websiteId, start, end, dimension, limit }],
    queryFn: async () => {
      const res = await httpGet(getQueryUrl(), {
        websiteId,
        startDate: start,
        endDate: end,
        dimension,
        limit,
      });

      if (!res.ok) {
        const { message, code, status } = res.data?.error || {};

        throw Object.assign(new Error(message), { code, status: status ?? res.status });
      }

      return res.data;
    },
    enabled: !!websiteId && (options?.enabled ?? true),
    placeholderData: keepPreviousData,
    // Errors such as a missing connection are not transient; do not hammer Google on retry.
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
