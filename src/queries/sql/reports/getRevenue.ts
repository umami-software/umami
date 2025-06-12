import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, getDatabaseType, POSTGRESQL, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

export interface RevenueCriteria {
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

export async function getRevenue(...args: [websiteId: string, criteria: RevenueCriteria]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: RevenueCriteria,
): Promise<RevenueResult> {
  const { startDate, endDate, unit = 'day', currency } = criteria;
  const { getDateSQL, rawQuery } = prisma;
  const db = getDatabaseType();
  const like = db === POSTGRESQL ? 'ilike' : 'like';

  const chart = await rawQuery(
    `
    select
      event_name x,
      ${getDateSQL('created_at', unit)} t,
      sum(revenue) y
    from revenue
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and currency like {{currency}}
    group by  x, t
    order by t
    `,
    { websiteId, startDate, endDate, unit, currency },
  );

  const country = await rawQuery(
    `
    select
      s.country as name,
      sum(r.revenue) value
    from revenue r
    join session s
    on s.session_id = r.session_id
    where r.website_id = {{websiteId::uuid}}
      and r.created_at between {{startDate}} and {{endDate}}
      and r.currency ${like} {{currency}}
    group by s.country
    `,
    { websiteId, startDate, endDate, currency },
  );

  const total = await rawQuery(
    `
    select
      sum(revenue) as sum,
      count(distinct event_id) as count,
      count(distinct session_id) as unique_count
    from revenue r
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and currency ${like} {{currency}}
  `,
    { websiteId, startDate, endDate, currency },
  ).then(result => result?.[0]);

  total.average = total.count > 0 ? total.sum / total.count : 0;

  const table = await rawQuery(
    `
    select
      currency,
      sum(revenue) as sum,
      count(distinct event_id) as count,
      count(distinct session_id) as unique_count
    from revenue r
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    group by currency
    order by sum desc
    `,
    { websiteId, startDate, endDate, unit, currency },
  );

  return { chart, country, table, total };
}

async function clickhouseQuery(
  websiteId: string,
  criteria: RevenueCriteria,
): Promise<RevenueResult> {
  const { startDate, endDate, unit = 'day', currency } = criteria;
  const { getDateSQL, rawQuery } = clickhouse;

  const chart = await rawQuery<
    {
      x: string;
      t: string;
      y: number;
    }[]
  >(
    `
    select
      event_name x,
      ${getDateSQL('created_at', unit)} t,
      sum(revenue) y
    from website_revenue
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and currency = {currency:String}
    group by  x, t
    order by t
    `,
    { websiteId, startDate, endDate, unit, currency },
  );

  const country = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    select
      s.country as name,
      sum(w.revenue) as value
    from website_revenue w
    join (select distinct website_id, session_id, country
          from website_event
          where website_id = {websiteId:UUID}) s
      on w.website_id = s.website_id
        and w.session_id = s.session_id
   where w.website_id = {websiteId:UUID}
      and w.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and w.currency = {currency:String}
    group by s.country
    `,
    { websiteId, startDate, endDate, currency },
  );

  const total = await rawQuery<{
    sum: number;
    count: number;
    unique_count: number;
  }>(
    `
    select
      sum(revenue) as sum,
      uniqExact(event_id) as count,
      uniqExact(session_id) as unique_count
    from website_revenue
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and currency = {currency:String}
    `,
    { websiteId, startDate, endDate, currency },
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
      currency,
      sum(revenue) as sum,
      uniqExact(event_id) as count,
      uniqExact(session_id) as unique_count
    from website_revenue
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by currency
    order by sum desc
    `,
    { websiteId, startDate, endDate, unit, currency },
  );

  return { chart, country, table, total };
}
