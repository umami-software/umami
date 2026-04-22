import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
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
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<PerformanceStatsResult> {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const result = await rawQuery(
    `
    select
      percentile_cont(0.75) within group (order by lcp) as lcp,
      percentile_cont(0.75) within group (order by inp) as inp,
      percentile_cont(0.75) within group (order by cls) as cls,
      percentile_cont(0.75) within group (order by fcp) as fcp,
      percentile_cont(0.75) within group (order by ttfb) as ttfb,
      count(*) as count
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.event_type = 5
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    `,
    queryParams,
  );

  return result?.[0] || { lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0, count: 0 };
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<PerformanceStatsResult> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  const result = await rawQuery<PerformanceStatsResult>(
    `
    select
      quantile(0.75)(lcp) as lcp,
      quantile(0.75)(inp) as inp,
      quantile(0.75)(cls) as cls,
      quantile(0.75)(fcp) as fcp,
      quantile(0.75)(ttfb) as ttfb,
      count() as count
    from website_event
    ${cohortQuery}
    where website_event.website_id = {websiteId:UUID}
      and website_event.event_type = 5
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
    `,
    queryParams,
  );

  return result?.[0] || { lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0, count: 0 };
}

async function oceanbaseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<PerformanceStatsResult> {
  const { rawQuery, parseFilters } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, buildParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  const result = await rawQuery(
    `
    SELECT
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY lcp) AS lcp,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY inp) AS inp,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY cls) AS cls,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY fcp) AS fcp,
      PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY ttfb) AS ttfb,
      COUNT(*) AS count
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = ?
      AND website_event.event_type = 5
      AND website_event.created_at BETWEEN ? AND ?
      ${filterQuery}
    `,
    params,
  );

  return result?.[0] || { lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0, count: 0 };
}
