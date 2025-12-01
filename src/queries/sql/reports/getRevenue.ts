import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export interface RevenuParameters {
  startDate: Date;
  endDate: Date;
  unit: string;
  timezone: string;
  currency: string;
}

export interface RevenueResult {
  chart: { x: string; t: string; y: number }[];
  country: { name: string; value: number }[];
  total: { sum: number; count: number; average: number; unique_count: number };
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
): Promise<RevenueResult> {
  const { startDate, endDate, unit = 'day', timezone = 'utc', currency } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = prisma;
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  const joinQuery = filterQuery
    ? `join website_event
      on website_event.website_id = revenue.website_id
        and website_event.session_id = revenue.session_id
        and website_event.event_id = revenue.event_id
        and website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}`
    : '';

  const chart = await rawQuery(
    `
    select
      revenue.event_name x,
      ${getDateSQL('revenue.created_at', unit, timezone)} t,
      sum(revenue.revenue) y
    from revenue
    ${joinQuery}
    ${cohortQuery}
    ${joinSessionQuery}
    where revenue.website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
      and revenue.currency ilike {{currency}}
      ${filterQuery}
    group by  x, t
    order by t
    `,
    queryParams,
  );

  const country = await rawQuery(
    `
    select
      session.country as name,
      sum(revenue) value
    from revenue 
    ${joinQuery}
    join session 
      on session.website_id = revenue.website_id
        and session.session_id = revenue.session_id
    ${cohortQuery}
    where revenue.website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
      and revenue.currency ilike {{currency}}
      ${filterQuery}
    group by session.country
    `,
    queryParams,
  );

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
      and revenue.currency ilike {{currency}}
      ${filterQuery}
  `,
    queryParams,
  ).then(result => result?.[0]);

  total.average = total.count > 0 ? Number(total.sum) / Number(total.count) : 0;

  return { chart, country, total };
}

async function clickhouseQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
): Promise<RevenueResult> {
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
    ? `join website_event
   on website_event.website_id = website_revenue.website_id
    and website_event.session_id = website_revenue.session_id
    and website_event.event_id = website_revenue.event_id
    and website_event.website_id = {websiteId:UUID}
    and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}`
    : '';

  const chart = await rawQuery<
    {
      x: string;
      t: string;
      y: number;
    }[]
  >(
    `
    select
      website_revenue.event_name x,
      ${getDateSQL('website_revenue.created_at', unit, timezone)} t,
      sum(website_revenue.revenue) y
    from website_revenue
    ${joinQuery}
    ${cohortQuery}
    where website_revenue.website_id = {websiteId:UUID}
      and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and website_revenue.currency = {currency:String}
      ${filterQuery}
    group by  x, t
    order by t
    `,
    queryParams,
  );

  const country = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
      select
        website_event.country as name,
        sum(website_revenue.revenue) as value
      from website_revenue
      join website_event
      on website_event.website_id = website_revenue.website_id
        and website_event.session_id = website_revenue.session_id
        and website_event.event_id = website_revenue.event_id
        and website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${cohortQuery}
      where website_revenue.website_id = {websiteId:UUID}
        and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and website_revenue.currency = {currency:String}
        ${filterQuery}
      group by website_event.country
      order by value desc
    `,
    queryParams,
  );

  const total = await rawQuery<{
    sum: number;
    count: number;
    unique_count: number;
  }>(
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
      and website_revenue.currency = {currency:String}
      ${filterQuery}
    `,
    queryParams,
  ).then(result => result?.[0]);

  total.average = total.count > 0 ? total.sum / total.count : 0;

  return { chart, country, total };
}
