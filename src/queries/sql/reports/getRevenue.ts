import clickhouse from '@/lib/clickhouse';
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

export async function getRevenue(
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

  const chart = await rawQuery(
    `
    select
      revenue.event_name x,
      ${getDateSQL('revenue.created_at', unit, timezone)} t,
      sum(revenue.revenue) y,
      count(revenue.event_id) count
    from revenue
    ${joinQuery}
    ${cohortQuery}
    ${joinSessionQuery}
    where revenue.website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
      and upper(revenue.currency) = {{currency}}
      ${filterQuery}
    group by  x, t
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

  const chart = await rawQuery<{ x: string; t: string; y: number; count: number }[]>(
    `
    select
      website_revenue.event_name x,
      ${getDateSQL('website_revenue.created_at', unit, timezone)} t,
      sum(website_revenue.revenue) y,
      count(website_revenue.event_id) count
    from website_revenue
    ${joinQuery}
    ${cohortQuery}
    where website_revenue.website_id = {websiteId:UUID}
      and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and upper(website_revenue.currency) = {currency:String}
      ${filterQuery}
    group by  x, t
    order by t
    `,
    queryParams,
  );

  return { chart };
}
