import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

import type { PerformanceParameters, PerformanceResult } from './getPerformance';

export async function getPerformanceChart(
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
): Promise<Pick<PerformanceResult, 'chart'>> {
  const { startDate, endDate, unit = 'day', timezone = 'utc', metric = 'lcp' } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const chart = await rawQuery(
    `
    select
      ${getDateSQL('website_event.created_at', unit, timezone)} t,
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

  return { chart };
}

async function clickhouseQuery(
  websiteId: string,
  parameters: PerformanceParameters,
  filters: QueryFilters,
): Promise<Pick<PerformanceResult, 'chart'>> {
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

  return { chart };
}
