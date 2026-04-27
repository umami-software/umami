import clickhouse from '@/lib/clickhouse';
import oceanbase from '@/lib/oceanbase';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import type { RevenuParameters } from './getRevenue';

export interface RevenueStatsResult {
  sum: number;
  count: number;
  average: number;
  unique_count: number;
  arpu: number;
}

export async function getRevenueStats(
  ...args: [websiteId: string, parameters: RevenuParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
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
      count(distinct revenue.session_id) as unique_count,
      (select count(distinct session_id)
       from website_event
       where website_id = {{websiteId::uuid}}
         and created_at between {{startDate}} and {{endDate}}) as total_sessions
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
  total.arpu = total.total_sessions > 0 ? Number(total.sum) / Number(total.total_sessions) : 0;

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

  const total = await rawQuery<{
    sum: number;
    count: number;
    unique_count: number;
    total_sessions: number;
  }>(
    `
    select
      sum(website_revenue.revenue) as sum,
      uniqExact(website_revenue.event_id) as count,
      uniqExact(website_revenue.session_id) as unique_count,
      (select uniqExact(session_id)
       from website_event
       where website_id = {websiteId:UUID}
         and created_at between {startDate:DateTime64} and {endDate:DateTime64}) as total_sessions
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
  total.arpu = total.total_sessions > 0 ? total.sum / total.total_sessions : 0;

  return total;
}

async function oceanbaseQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
): Promise<RevenueStatsResult> {
  const { startDate, endDate, currency } = parameters;
  const { rawQuery, parseFilters } = oceanbase;
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  const joinQuery =
    filterQuery || cohortQuery
      ? `JOIN (SELECT *
               FROM website_event
               WHERE website_id = ?
                  AND created_at BETWEEN ? AND ?
                  AND event_type = 2) website_event
        ON website_event.website_id = revenue.website_id
          AND website_event.session_id = revenue.session_id
          AND website_event.event_id = revenue.event_id`
      : '';

  const params: any[] = [];

  // Subquery params (total_sessions)
  params.push(websiteId, startDate, endDate);

  // joinQuery params (if present)
  if (filterQuery || cohortQuery) {
    params.push(websiteId, startDate, endDate);
  }

  // Main query params
  params.push(websiteId, startDate, endDate, currency, ...queryParams);

  const total = await rawQuery<{
    sum: number;
    count: number;
    unique_count: number;
    total_sessions: number;
  }[]>(
    `
    SELECT
      SUM(revenue.revenue) AS sum,
      COUNT(DISTINCT revenue.event_id) AS count,
      COUNT(DISTINCT revenue.session_id) AS unique_count,
      (SELECT COUNT(DISTINCT session_id)
       FROM website_event
       WHERE website_id = ?
         AND created_at BETWEEN ? AND ?) AS total_sessions
    FROM revenue
    ${joinQuery}
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE revenue.website_id = ?
      AND revenue.created_at BETWEEN ? AND ?
      AND UPPER(revenue.currency) = ?
      ${filterQuery}
  `,
    params,
  ).then(result => result?.[0]);

  return {
    sum: Number(total?.sum || 0),
    count: Number(total?.count || 0),
    average: total && total.count > 0 ? Number(total.sum) / Number(total.count) : 0,
    unique_count: Number(total?.unique_count || 0),
    arpu: total && total.total_sessions > 0 ? Number(total.sum) / Number(total.total_sessions) : 0,
  };
}
