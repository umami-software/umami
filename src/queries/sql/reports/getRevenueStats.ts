import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import type { RevenuParameters } from './getRevenue';

export interface RevenueStatsResult {
  sum: number;
  count: number;
  average: number;
  unique_count: number;
}

export async function getRevenueStats(
  ...args: [websiteId: string, parameters: RevenuParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
): Promise<RevenueStatsResult> {
  const { startDate, endDate, currency } = parameters;
  const { rawQuery, parseFilters } = prisma;
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  const joinQuery =
    filterQuery || cohortQuery
      ? `join (select *
               from website_event
               where website_id = {{websiteId::uuid}}
                  and created_at between {{startDate}} and {{endDate}}
                  and event_type = 2) website_event
        on website_event.website_id = revenue.website_id
          and website_event.session_id = revenue.session_id
          and website_event.event_id = revenue.event_id`
      : '';

  const total = await rawQuery(
    `
    select
      sum(revenue.revenue) as sum,
      count(distinct revenue.event_id) as count,
      count(distinct revenue.session_id) as unique_count
    from revenue
    ${joinQuery}
    ${cohortQuery}
    ${joinSessionQuery}
    where revenue.website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
      and upper(revenue.currency) = {{currency}}
      ${filterQuery}
  `,
    queryParams,
  ).then(result => result?.[0]);

  total.average = total.count > 0 ? Number(total.sum) / Number(total.count) : 0;

  return total;
}

async function clickhouseQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
): Promise<RevenueStatsResult> {
  const { startDate, endDate, currency } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  const joinQuery = filterQuery
    ? `any left join (
      select *
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = 2) website_event
    on website_event.website_id = website_revenue.website_id
      and website_event.session_id = website_revenue.session_id
      and website_event.event_id = website_revenue.event_id`
    : '';

  const total = await rawQuery<{ sum: number; count: number; unique_count: number }>(
    `
    select
      sum(website_revenue.revenue) as sum,
      uniqExact(website_revenue.event_id) as count,
      uniqExact(website_revenue.session_id) as unique_count
    from website_revenue
    ${joinQuery}
    ${cohortQuery}
    where website_revenue.website_id = {websiteId:UUID}
      and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and upper(website_revenue.currency) = {currency:String}
      ${filterQuery}
    `,
    queryParams,
  ).then(result => result?.[0]);

  total.average = total.count > 0 ? total.sum / total.count : 0;

  return total;
}
