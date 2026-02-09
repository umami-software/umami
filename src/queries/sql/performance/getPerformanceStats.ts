import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface PerformanceStatsResult {
  lcp: number;
  inp: number;
  cls: number;
  fcp: number;
  ttfb: number;
  count: number;
}

export async function getPerformanceStats(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<PerformanceStatsResult> {
  const { rawQuery } = prisma;
  const { startDate, endDate } = filters;

  const result = await rawQuery(
    `
    select
      percentile_cont(0.75) within group (order by lcp) as lcp,
      percentile_cont(0.75) within group (order by inp) as inp,
      percentile_cont(0.75) within group (order by cls) as cls,
      percentile_cont(0.75) within group (order by fcp) as fcp,
      percentile_cont(0.75) within group (order by ttfb) as ttfb,
      count(*) as count
    from performance
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    `,
    { websiteId, startDate, endDate },
  );

  return result?.[0] || { lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0, count: 0 };
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<PerformanceStatsResult> {
  const { rawQuery } = clickhouse;
  const { startDate, endDate } = filters;

  const result = await rawQuery<PerformanceStatsResult>(
    `
    select
      quantile(0.75)(lcp) as lcp,
      quantile(0.75)(inp) as inp,
      quantile(0.75)(cls) as cls,
      quantile(0.75)(fcp) as fcp,
      quantile(0.75)(ttfb) as ttfb,
      count() as count
    from website_performance
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    `,
    { websiteId, startDate, endDate },
  );

  return result?.[0] || { lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0, count: 0 };
}
