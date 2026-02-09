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
  pages: { urlPath: string; p75: number; count: number }[];
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
  const { getDateSQL, rawQuery } = prisma;

  const chart = await rawQuery(
    `
    select
      ${getDateSQL('created_at', unit, timezone)} t,
      percentile_cont(0.5) within group (order by ${metric}) as p50,
      percentile_cont(0.75) within group (order by ${metric}) as p75,
      percentile_cont(0.95) within group (order by ${metric}) as p95
    from performance
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    group by t
    order by t
    `,
    { websiteId, startDate, endDate },
  );

  const pages = await rawQuery(
    `
    select
      url_path as "urlPath",
      percentile_cont(0.75) within group (order by ${metric}) as p75,
      count(*) as count
    from performance
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    group by url_path
    order by p75 desc
    limit 100
    `,
    { websiteId, startDate, endDate },
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
    from performance
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    `,
    { websiteId, startDate, endDate },
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

  return { chart, pages, summary };
}

async function clickhouseQuery(
  websiteId: string,
  parameters: PerformanceParameters,
  filters: QueryFilters,
): Promise<PerformanceResult> {
  const { startDate, endDate, unit = 'day', timezone = 'utc', metric = 'lcp' } = parameters;
  const { getDateSQL, rawQuery } = clickhouse;

  const chart = await rawQuery<{ t: string; p50: number; p75: number; p95: number }[]>(
    `
    select
      ${getDateSQL('created_at', unit, timezone)} t,
      quantile(0.5)(${metric}) as p50,
      quantile(0.75)(${metric}) as p75,
      quantile(0.95)(${metric}) as p95
    from website_performance
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by t
    order by t
    `,
    { websiteId, startDate, endDate },
  );

  const pages = await rawQuery<{ urlPath: string; p75: number; count: number }[]>(
    `
    select
      url_path as "urlPath",
      quantile(0.75)(${metric}) as p75,
      count() as count
    from website_performance
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by url_path
    order by p75 desc
    limit 100
    `,
    { websiteId, startDate, endDate },
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
    from website_performance
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    `,
    { websiteId, startDate, endDate },
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

  return { chart, pages, summary };
}
