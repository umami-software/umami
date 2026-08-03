import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface RevenuParameters {
  startDate: Date;
  endDate: Date;
  unit: string;
  timezone: string;
  currency: string;
  compare?: string;
}

export async function getRevenueChart(
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
) {
  const { startDate, endDate, unit = 'day', timezone = 'utc', currency } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = prisma;
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  const chart = await rawQuery(
    `
    with
      filtered_sessions as (
        select distinct website_event.website_id, website_event.session_id
        from website_event
        ${cohortQuery}
        ${joinSessionQuery}
        where website_event.website_id = {{websiteId::uuid}}
          and website_event.event_type != ${EVENT_TYPE.performance}
        ${dateQuery}
        ${filterQuery}
      ),
      filtered_revenue as (
        select
          revenue.event_id,
          revenue.event_name,
          revenue.created_at,
          revenue.revenue
        from revenue
        join filtered_sessions
          on filtered_sessions.website_id = revenue.website_id
         and filtered_sessions.session_id = revenue.session_id
        where revenue.website_id = {{websiteId::uuid}}
          and revenue.created_at between {{startDate}} and {{endDate}}
          and upper(revenue.currency) = {{currency}}
      )
    select
      filtered_revenue.event_name x,
      ${getDateSQL('filtered_revenue.created_at', unit, timezone)} t,
      sum(filtered_revenue.revenue) y,
      count(filtered_revenue.event_id) count
    from filtered_revenue
    group by x, t
    order by t
    `,
    queryParams,
  );

  return { chart };
}

async function clickhouseQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, unit = 'day', timezone = 'utc', currency } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, dateQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  const chart = await rawQuery<{ x: string; t: string; y: number; count: number }[]>(
    `
    with
      filtered_sessions as (
        select website_id, session_id
        from website_event
        ${cohortQuery}
        where website_id = {websiteId:UUID}
          and event_type != ${EVENT_TYPE.performance}
        ${dateQuery}
        ${filterQuery}
        group by website_id, session_id
      ),
      filtered_revenue as (
        select
          website_revenue.event_id,
          website_revenue.event_name,
          website_revenue.created_at,
          website_revenue.revenue
        from website_revenue
        any inner join filtered_sessions
          on filtered_sessions.website_id = website_revenue.website_id
         and filtered_sessions.session_id = website_revenue.session_id
        where website_revenue.website_id = {websiteId:UUID}
          and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and upper(website_revenue.currency) = {currency:String}
      )
    select
      filtered_revenue.event_name x,
      ${getDateSQL('filtered_revenue.created_at', unit, timezone)} t,
      sum(filtered_revenue.revenue) y,
      count(filtered_revenue.event_id) count
    from filtered_revenue
    group by x, t
    order by t
    `,
    queryParams,
  );

  return { chart };
}
