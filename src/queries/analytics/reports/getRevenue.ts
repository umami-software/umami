import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, getDatabaseType, POSTGRESQL, PRISMA, runQuery } from 'lib/db';
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
    currency: string;
  },
): Promise<{
  chart: { x: string; t: string; y: number }[];
  country: { name: string; value: number }[];
  total: { sum: number; count: number; unique_count: number };
  table: {
    currency: string;
    sum: number;
    count: number;
    unique_count: number;
  }[];
}> {
  const { startDate, endDate, timezone = 'UTC', unit = 'day', currency } = criteria;
  const { getDateSQL, rawQuery } = prisma;
  const db = getDatabaseType();
  const like = db === POSTGRESQL ? 'ilike' : 'like';

  const chartRes = await rawQuery(
    `
    select
      we.event_name x,
      ${getDateSQL('ed.created_at', unit, timezone)} t,
      sum(coalesce(cast(number_value as decimal(10,2)), cast(string_value as decimal(10,2)))) y
    from event_data ed
    join website_event we
    on we.event_id = ed.website_event_id
    join (select website_event_id
          from event_data
          where data_key ${like} '%currency%'
            and string_value = {{currency}}) currency
    on currency.website_event_id = ed.website_event_id
    where ed.website_id = {{websiteId::uuid}}
      and ed.created_at between {{startDate}} and {{endDate}}
      and ed.data_key ${like} '%revenue%'
    group by  x, t
    order by t
    `,
    { websiteId, startDate, endDate, unit, timezone, currency },
  );

  const countryRes = await rawQuery(
    `
    select
      s.country as name,
      sum(coalesce(cast(number_value as decimal(10,2)), cast(string_value as decimal(10,2)))) value
    from event_data ed
    join website_event we
    on we.event_id = ed.website_event_id
    join session s
    on s.session_id = we.session_id
    join (select website_event_id
          from event_data
          where data_key ${like} '%currency%'
            and string_value = {{currency}}) currency
    on currency.website_event_id = ed.website_event_id
    where ed.website_id = {{websiteId::uuid}}
      and ed.created_at between {{startDate}} and {{endDate}}
      and ed.data_key ${like} '%revenue%'
    group by s.country
    `,
    { websiteId, startDate, endDate, currency },
  );

  const totalRes = await rawQuery(
    `
    select
      sum(coalesce(cast(number_value as decimal(10,2)), cast(string_value as decimal(10,2)))) as sum,
      count(distinct event_id) as count,
      count(distinct session_id) as unique_count
    from event_data ed
    join website_event we
    on we.event_id = ed.website_event_id
    join (select website_event_id
          from event_data
          where data_key ${like} '%currency%'
            and string_value = {{currency}}) currency
      on currency.website_event_id = ed.website_event_id
    where ed.website_id = {{websiteId::uuid}}
      and ed.created_at between {{startDate}} and {{endDate}}
      and ed.data_key ${like} '%revenue%'
  `,
    { websiteId, startDate, endDate, currency },
  ).then(result => result?.[0]);

  const tableRes = await rawQuery(
    `
    select
      c.currency,
      sum(coalesce(cast(number_value as decimal(10,2)), cast(string_value as decimal(10,2)))) as sum,
      count(distinct ed.website_event_id) as count,
      count(distinct we.session_id) as unique_count
    from event_data ed
    join website_event we
      on we.event_id = ed.website_event_id
    join (select website_event_id, string_value as currency
          from event_data
          where data_key ${like} '%currency%') c
      on c.website_event_id = ed.website_event_id
    where ed.website_id = {{websiteId::uuid}}
      and ed.created_at between {{startDate}} and {{endDate}}
      and ed.data_key ${like} '%revenue%'
    group by c.currency
    order by sum desc;
    `,
    { websiteId, startDate, endDate, unit, timezone, currency },
  );

  return { chart: chartRes, country: countryRes, total: totalRes, table: tableRes };
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
  total: { sum: number; count: number; unique_count: number };
  table: {
    currency: string;
    sum: number;
    count: number;
    unique_count: number;
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
    unique_count: number;
  }>(
    `
    select
      sum(coalesce(toDecimal64(number_value, 2), toDecimal64(string_value, 2))) as sum,
      uniqExact(event_id) as count,
      uniqExact(session_id) as unique_count
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
      unique_count: number;
    }[]
  >(
    `
    select
      c.currency,
      sum(coalesce(toDecimal64(ed.number_value, 2), toDecimal64(ed.string_value, 2))) as sum,
      uniqExact(ed.event_id) as count,
      uniqExact(ed.session_id) as unique_count
    from event_data ed
    join (select event_id, string_value as currency
          from event_data
          where positionCaseInsensitive(data_key, 'currency') > 0) c
      on c.event_id = ed.event_id
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
