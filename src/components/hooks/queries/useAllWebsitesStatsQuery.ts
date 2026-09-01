import type { ReactQueryOptions } from '@/lib/types';
import { useApi } from '../useApi';
import { useDateParameters } from '../useDateParameters';
import { useModified } from '../useModified';

// /api/websites/charts accepts at most 20 ids per request
const CHARTS_BATCH_SIZE = 20;
const STATS_CONCURRENCY = 6;
const WEBSITES_PAGE_SIZE = 200;

export interface AllWebsitesTotals {
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export interface WebsiteOverview {
  id: string;
  name: string;
  domain: string;
  stats: AllWebsitesTotals;
  series: number[];
}

export interface AllWebsitesStatsData {
  websites: WebsiteOverview[];
  totals: AllWebsitesTotals;
  series: number[];
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function useAllWebsitesStatsQuery(options?: ReactQueryOptions<AllWebsitesStatsData>) {
  const { get, useQuery } = useApi();
  const { startAt, endAt, timezone } = useDateParameters();
  const { modified } = useModified('websites');

  return useQuery<AllWebsitesStatsData>({
    queryKey: ['websites:all:stats', { startAt, endAt, timezone, modified }],
    queryFn: async () => {
      const { data: websites = [] } = await get('/me/websites', {
        pageSize: WEBSITES_PAGE_SIZE,
      });
      const ids: string[] = websites.map(({ id }) => id);

      const charts: Record<string, { values: number[]; total: number }> = {};
      for (const batch of chunk(ids, CHARTS_BATCH_SIZE)) {
        const { data } = await get('/websites/charts', {
          ids: batch.join(','),
          startAt,
          endAt,
          timezone,
        });
        Object.assign(charts, data);
      }

      const statsById: Record<string, AllWebsitesTotals> = {};
      for (const batch of chunk(ids, STATS_CONCURRENCY)) {
        await Promise.all(
          batch.map(async id => {
            statsById[id] = await get(`/websites/${id}/stats`, { startAt, endAt });
          }),
        );
      }

      const totals: AllWebsitesTotals = {
        pageviews: 0,
        visitors: 0,
        visits: 0,
        bounces: 0,
        totaltime: 0,
      };
      const series: number[] = [];

      const result: WebsiteOverview[] = websites.map(({ id, name, domain }) => {
        const stats = statsById[id];
        const values = charts[id]?.values ?? [];

        for (const key of Object.keys(totals) as (keyof AllWebsitesTotals)[]) {
          totals[key] += Number(stats?.[key]) || 0;
        }
        values.forEach((value, index) => {
          series[index] = (series[index] ?? 0) + value;
        });

        return { id, name, domain, stats, series: values };
      });

      return { websites: result, totals, series };
    },
    ...options,
  });
}
