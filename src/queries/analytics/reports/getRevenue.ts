import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getRevenue(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      unit: string;
      timezone: string;
      currency: string;
    },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    unit: string;
    timezone: string;
  },
): Promise<{
  chart: { time: string; sum: number; avg: number; count: number; uniqueCount: number }[];
  total: { sum: number; avg: number; count: number; uniqueCount: number };
}> {
  const { startDate, endDate, timezone = 'UTC', unit = 'day' } = criteria;
  const { getDateSQL, rawQuery } = prisma;

  const chartRes = await rawQuery(
    `
    select
      ${getDateSQL('website_event.created_at', unit, timezone)} time,
      sum(case when data_key = {{revenueProperty}} then number_value else 0 end) sum,
      avg(case when data_key = {{revenueProperty}} then number_value else 0 end) avg,
      count(case when data_key = {{revenueProperty}} then 1 else 0 end) count,
      count(distinct {{userProperty}}) uniqueCount
    from event_data
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_name = {{eventType}}
      and data_key in ({{revenueProperty}} , {{userProperty}})
    group by 1
    `,
    { websiteId, startDate, endDate },
  );

  const totalRes = await rawQuery(
    `
    select
      sum(case when data_key = {{revenueProperty}} then number_value else 0 end) sum,
      avg(case when data_key = {{revenueProperty}} then number_value else 0 end) avg,
      count(case when data_key = {{revenueProperty}} then 1 else 0 end) count,
      count(distinct {{userProperty}}) uniqueCount
    from event_data
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_name = {{eventType}}
      and data_key in ({{revenueProperty}} , {{userProperty}})
    group by 1
    `,
    { websiteId, startDate, endDate },
  );

  return { chart: chartRes, total: totalRes };
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    unit: string;
    timezone: string;
    currency: string;
  },
): Promise<{
  chart: { x: string; t: string; y: number }[];
  country: { name: string; value: number }[];
  total: { sum: number; avg: number; count: number; uniqueCount: number };
  table: {
    currency: string;
    sum: number;
    avg: number;
    count: number;
    uniqueCount: number;
  }[];
}> {
  const { startDate, endDate, timezone = 'UTC', unit = 'day', currency } = criteria;
  const { getDateSQL, rawQuery } = clickhouse;

  const chartRes = await rawQuery<
    {
      x: string;
      t: string;
      y: number;
    }[]
  >(
    `
    select
      event_name x,
      ${getDateSQL('created_at', unit, timezone)} t,
      sum(coalesce(toDecimal64(number_value, 2), toDecimal64(string_value, 2))) y
    from event_data
    join (select event_id 
          from event_data
          where positionCaseInsensitive(data_key, 'currency') > 0
            and string_value = {currency:String}) currency
    on currency.event_id = event_data.event_id
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and positionCaseInsensitive(data_key, 'revenue') > 0
    group by  x, t
    order by t
    `,
    { websiteId, startDate, endDate, unit, timezone, currency },
  );

  const countryRes = await rawQuery<
    {
      name: string;
      value: number;
    }[]
  >(
    `
    select
      s.country as name,
      sum(coalesce(toDecimal64(number_value, 2), toDecimal64(string_value, 2))) as value
    from event_data ed
    join (select event_id
          from event_data
          where positionCaseInsensitive(data_key, 'currency') > 0
            and string_value = {currency:String}) c
    on c.event_id = ed.event_id
    join (select distinct website_id, session_id, country
          from website_event_stats_hourly
          where website_id = {websiteId:UUID}) s
    on ed.website_id = s.website_id
        and ed.session_id = s.session_id
   where ed.website_id = {websiteId:UUID}
      and ed.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and positionCaseInsensitive(ed.data_key, 'revenue') > 0
    group by s.country

    `,
    { websiteId, startDate, endDate, currency },
  );

  const totalRes = await rawQuery<{
    sum: number;
    avg: number;
    count: number;
    uniqueCount: number;
  }>(
    `
    select
      sum(coalesce(toDecimal64(number_value, 2), toDecimal64(string_value, 2))) as sum,
      avg(coalesce(toDecimal64(number_value, 2), toDecimal64(string_value, 2))) as avg,
      uniqExact(event_id) as count,
      uniqExact(session_id) as uniqueCount
    from event_data
    join (select event_id 
          from event_data
          where positionCaseInsensitive(data_key, 'currency') > 0
            and string_value = {currency:String}) currency
    on currency.event_id = event_data.event_id
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and positionCaseInsensitive(data_key, 'revenue') > 0
    `,
    { websiteId, startDate, endDate, currency },
  ).then(result => result?.[0]);

  const tableRes = await rawQuery<
    {
      currency: string;
      sum: number;
      avg: number;
      count: number;
      uniqueCount: number;
    }[]
  >(
    `
    select
      c.currency,
      sum(coalesce(toDecimal64(ed.number_value, 2), toDecimal64(ed.string_value, 2))) as sum,
      avg(coalesce(toDecimal64(ed.number_value, 2), toDecimal64(ed.string_value, 2))) as avg,
      uniqExact(ed.event_id) as count,
      uniqExact(ed.session_id) as uniqueCount
    from event_data ed
    join (select event_id, string_value as currency
          from event_data
          where positionCaseInsensitive(data_key, 'currency') > 0) c
      ON c.event_id = ed.event_id
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and positionCaseInsensitive(data_key, 'revenue') > 0
    group by c.currency
    order by sum desc;
    `,
    { websiteId, startDate, endDate, unit, timezone, currency },
  );

  return { chart: chartRes, country: countryRes, total: totalRes, table: tableRes };
}
