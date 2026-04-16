import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface PerformanceParameters {
  startDate: Date;
  endDate: Date;
  unit: string;
  timezone: string;
  metric: string;
}

export interface PerformanceResult {
  chart: { t: string; p50: number; p75: number; p95: number }[];
  summary: {
    lcp: { p50: number; p75: number; p95: number };
    inp: { p50: number; p75: number; p95: number };
    cls: { p50: number; p75: number; p95: number };
    fcp: { p50: number; p75: number; p95: number };
    ttfb: { p50: number; p75: number; p95: number };
    count: number;
  };
}

export async function getPerformance(
  ...args: [websiteId: string, parameters: PerformanceParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: PerformanceParameters,
  filters: QueryFilters,
): Promise<PerformanceResult> {
  const { startDate, endDate, unit = 'day', timezone = 'utc', metric = 'lcp' } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const chart = await rawQuery(
    `
    select
      ${getDateSQL('created_at', unit, timezone)} t,
      percentile_cont(0.5) within group (order by ${metric}) as p50,
      percentile_cont(0.75) within group (order by ${metric}) as p75,
      percentile_cont(0.95) within group (order by ${metric}) as p95
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.event_type = 5
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    group by t
    order by t
    `,
    { ...queryParams, startDate, endDate },
  );

  const summaryResult = await rawQuery(
    `
    select
      percentile_cont(0.5) within group (order by lcp) as lcp_p50,
      percentile_cont(0.75) within group (order by lcp) as lcp_p75,
      percentile_cont(0.95) within group (order by lcp) as lcp_p95,
      percentile_cont(0.5) within group (order by inp) as inp_p50,
      percentile_cont(0.75) within group (order by inp) as inp_p75,
      percentile_cont(0.95) within group (order by inp) as inp_p95,
      percentile_cont(0.5) within group (order by cls) as cls_p50,
      percentile_cont(0.75) within group (order by cls) as cls_p75,
      percentile_cont(0.95) within group (order by cls) as cls_p95,
      percentile_cont(0.5) within group (order by fcp) as fcp_p50,
      percentile_cont(0.75) within group (order by fcp) as fcp_p75,
      percentile_cont(0.95) within group (order by fcp) as fcp_p95,
      percentile_cont(0.5) within group (order by ttfb) as ttfb_p50,
      percentile_cont(0.75) within group (order by ttfb) as ttfb_p75,
      percentile_cont(0.95) within group (order by ttfb) as ttfb_p95,
      count(*) as count
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.event_type = 5
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    `,
    { ...queryParams, startDate, endDate },
  ).then(result => result?.[0]);

  const summary = {
    lcp: {
      p50: Number(summaryResult?.lcp_p50 || 0),
      p75: Number(summaryResult?.lcp_p75 || 0),
      p95: Number(summaryResult?.lcp_p95 || 0),
    },
    inp: {
      p50: Number(summaryResult?.inp_p50 || 0),
      p75: Number(summaryResult?.inp_p75 || 0),
      p95: Number(summaryResult?.inp_p95 || 0),
    },
    cls: {
      p50: Number(summaryResult?.cls_p50 || 0),
      p75: Number(summaryResult?.cls_p75 || 0),
      p95: Number(summaryResult?.cls_p95 || 0),
    },
    fcp: {
      p50: Number(summaryResult?.fcp_p50 || 0),
      p75: Number(summaryResult?.fcp_p75 || 0),
      p95: Number(summaryResult?.fcp_p95 || 0),
    },
    ttfb: {
      p50: Number(summaryResult?.ttfb_p50 || 0),
      p75: Number(summaryResult?.ttfb_p75 || 0),
      p95: Number(summaryResult?.ttfb_p95 || 0),
    },
    count: Number(summaryResult?.count || 0),
  };

  return { chart, summary };
}

async function clickhouseQuery(
  websiteId: string,
  parameters: PerformanceParameters,
  filters: QueryFilters,
): Promise<PerformanceResult> {
  const { startDate, endDate, unit = 'day', timezone = 'utc', metric = 'lcp' } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId });

  const chart = await rawQuery<{ t: string; p50: number; p75: number; p95: number }[]>(
    `
    select
      ${getDateSQL('created_at', unit, timezone)} t,
      quantile(0.5)(${metric}) as p50,
      quantile(0.75)(${metric}) as p75,
      quantile(0.95)(${metric}) as p95
    from website_event
    ${cohortQuery}
    where website_event.website_id = {websiteId:UUID}
      and website_event.event_type = 5
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
    group by t
    order by t
    `,
    { ...queryParams, startDate, endDate },
  );

  const summaryResult = await rawQuery<any>(
    `
    select
      quantile(0.5)(lcp) as lcp_p50,
      quantile(0.75)(lcp) as lcp_p75,
      quantile(0.95)(lcp) as lcp_p95,
      quantile(0.5)(inp) as inp_p50,
      quantile(0.75)(inp) as inp_p75,
      quantile(0.95)(inp) as inp_p95,
      quantile(0.5)(cls) as cls_p50,
      quantile(0.75)(cls) as cls_p75,
      quantile(0.95)(cls) as cls_p95,
      quantile(0.5)(fcp) as fcp_p50,
      quantile(0.75)(fcp) as fcp_p75,
      quantile(0.95)(fcp) as fcp_p95,
      quantile(0.5)(ttfb) as ttfb_p50,
      quantile(0.75)(ttfb) as ttfb_p75,
      quantile(0.95)(ttfb) as ttfb_p95,
      count() as count
    from website_event
    ${cohortQuery}
    where website_event.website_id = {websiteId:UUID}
      and website_event.event_type = 5
      and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
    `,
    { ...queryParams, startDate, endDate },
  ).then(result => result?.[0]);

  const summary = {
    lcp: {
      p50: Number(summaryResult?.lcp_p50 || 0),
      p75: Number(summaryResult?.lcp_p75 || 0),
      p95: Number(summaryResult?.lcp_p95 || 0),
    },
    inp: {
      p50: Number(summaryResult?.inp_p50 || 0),
      p75: Number(summaryResult?.inp_p75 || 0),
      p95: Number(summaryResult?.inp_p95 || 0),
    },
    cls: {
      p50: Number(summaryResult?.cls_p50 || 0),
      p75: Number(summaryResult?.cls_p75 || 0),
      p95: Number(summaryResult?.cls_p95 || 0),
    },
    fcp: {
      p50: Number(summaryResult?.fcp_p50 || 0),
      p75: Number(summaryResult?.fcp_p75 || 0),
      p95: Number(summaryResult?.fcp_p95 || 0),
    },
    ttfb: {
      p50: Number(summaryResult?.ttfb_p50 || 0),
      p75: Number(summaryResult?.ttfb_p75 || 0),
      p95: Number(summaryResult?.ttfb_p95 || 0),
    },
    count: Number(summaryResult?.count || 0),
  };

  return { chart, summary };
}
