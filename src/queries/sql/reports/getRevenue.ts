import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export interface RevenuParameters {
  startDate: Date;
  endDate: Date;
  unit: string;
  currency: string;
}

export interface RevenueResult {
  chart: { x: string; t: string; y: number }[];
  country: { name: string; value: number }[];
  total: { sum: number; count: number; average: number; unique_count: number };
  table: {
    currency: string;
    sum: number;
    count: number;
    unique_count: number;
  }[];
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
  const { startDate, endDate, currency, unit = 'day' } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = prisma;
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

  const chart = await rawQuery(
    `
    select
      revenue.event_name x,
      ${getDateSQL('revenue.created_at', unit)} t,
      sum(revenue.revenue) y
    from revenue
    join website_event
      on website_event.website_id = revenue.website_id
        and website_event.session_id = revenue.session_id
        and website_event.event_id = revenue.event_id
        and website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    where revenue.website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
      and revenue.currency like {{currency}}
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
      sum(r.revenue) value
    from revenue 
    join website_event
      on website_event.website_id = revenue.website_id
        and website_event.session_id = revenue.session_id
        and website_event.event_id = revenue.event_id
        and website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
    join session 
      on session.website_id = revenue.website_id
        and session.session_id = revenue.session_id
    ${cohortQuery}
    where revenue.website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
      and revenue.currency = {{currency}}
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
    join website_event
      on website_event.website_id = revenue.website_id
        and website_event.session_id = revenue.session_id
        and website_event.event_id = revenue.event_id
        and website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    where revenue.website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
      and revenue.currency = {{currency}}
      ${filterQuery}
  `,
    queryParams,
  ).then(result => result?.[0]);

  total.average = total.count > 0 ? total.sum / total.count : 0;

  const table = await rawQuery(
    `
    select
      revenue.currency,
      sum(revenue.revenue) as sum,
      count(distinct revenue.event_id) as count,
      count(distinct revenue.session_id) as unique_count
    from revenue
    join website_event
      on website_event.website_id = revenue.website_id
        and website_event.session_id = revenue.session_id
        and website_event.event_id = revenue.event_id
        and website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
    ${cohortQuery}
    ${joinSessionQuery}
    where revenue.website_id = {{websiteId::uuid}}
      and revenue.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    group by revenue.currency
    order by sum desc
    `,
    queryParams,
  );

  return { chart, country, table, total };
}

async function clickhouseQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
): Promise<RevenueResult> {
  const { startDate, endDate, unit = 'day', currency } = parameters;
  const { getDateSQL, rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });

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
      ${getDateSQL('website_revenue.created_at', unit)} t,
      sum(website_revenue.revenue) y
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
    `,
    queryParams,
  ).then(result => result?.[0]);

  total.average = total.count > 0 ? total.sum / total.count : 0;

  const table = await rawQuery<
    {
      currency: string;
      sum: number;
      count: number;
      unique_count: number;
    }[]
  >(
    `
    select
      website_revenue.currency,
      sum(website_revenue.revenue) as sum,
      uniqExact(website_revenue.event_id) as count,
      uniqExact(website_revenue.session_id) as unique_count
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
      ${filterQuery}
    group by website_revenue.currency
    order by sum desc
    `,
    queryParams,
  );

  return { chart, country, table, total };
}
