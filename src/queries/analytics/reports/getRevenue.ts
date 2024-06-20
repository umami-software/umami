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
      eventName: string;
      revenueProperty: string;
      userProperty: string;
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
    eventName: string;
    revenueProperty: string;
    userProperty: string;
  },
): Promise<{
  chart: { time: string; sum: number; avg: number; count: number; uniqueCount: number }[];
  total: { sum: number; avg: number; count: number; uniqueCount: number };
}> {
  const {
    startDate,
    endDate,
    eventName,
    revenueProperty,
    userProperty,
    timezone = 'UTC',
    unit = 'day',
  } = criteria;
  const { getDateQuery, rawQuery } = prisma;

  const chartRes = await rawQuery(
    `
    select
      ${getDateQuery('website_event.created_at', unit, timezone)} time,
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
    { websiteId, startDate, endDate, eventName, revenueProperty, userProperty },
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
    { websiteId, startDate, endDate, eventName, revenueProperty, userProperty },
  );

  return { chart: chartRes, total: totalRes };
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    eventName: string;
    revenueProperty: string;
    userProperty: string;
    unit: string;
    timezone: string;
  },
): Promise<{
  chart: { time: string; sum: number; avg: number; count: number; uniqueCount: number }[];
  total: { sum: number; avg: number; count: number; uniqueCount: number };
}> {
  const {
    startDate,
    endDate,
    eventName,
    revenueProperty,
    userProperty = '',
    timezone = 'UTC',
    unit = 'day',
  } = criteria;
  const { getDateStringQuery, getDateQuery, rawQuery } = clickhouse;

  const chartRes = await rawQuery<{
    time: string;
    sum: number;
    avg: number;
    count: number;
    uniqueCount: number;
  }>(
    `
    select
      ${getDateStringQuery('g.time', unit)} as time, 
      g.sum as sum,
      g.avg as avg,
      g.count as count,
      g.uniqueCount as uniqueCount
    from (
      select 
        ${getDateQuery('created_at', unit, timezone)} as time,
        sumIf(number_value, data_key = {revenueProperty:String}) as sum,
        avgIf(number_value, data_key = {revenueProperty:String}) as avg,
        countIf(data_key = {revenueProperty:String}) as count,
        uniqExactIf(string_value, data_key = {userProperty:String}) as uniqueCount
      from event_data
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_name = {eventName:String}
        and data_key in ({revenueProperty:String}, {userProperty:String})
      group by time
    ) as g
    order by time
    `,
    { websiteId, startDate, endDate, eventName, revenueProperty, userProperty },
  ).then(result => {
    return Object.values(result).map((a: any) => {
      return {
        time: a.time,
        sum: Number(a.sum),
        avg: Number(a.avg),
        count: Number(a.count),
        uniqueCount: Number(!a.avg ? 0 : a.uniqueCount),
      };
    });
  });

  const totalRes = await rawQuery<{
    sum: number;
    avg: number;
    count: number;
    uniqueCount: number;
  }>(
    `
      select 
        sumIf(number_value, data_key = {revenueProperty:String}) as sum,
        avgIf(number_value, data_key = {revenueProperty:String}) as avg,
        countIf(data_key = {revenueProperty:String}) as count,
        uniqExactIf(string_value, data_key = {userProperty:String}) as uniqueCount
      from event_data
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_name = {eventName:String}
        and data_key in ({revenueProperty:String}, {userProperty:String})
    `,
    { websiteId, startDate, endDate, eventName, revenueProperty, userProperty },
  ).then(results => {
    const result = results[0];

    return {
      sum: Number(result.sum),
      avg: Number(result.avg),
      count: Number(result.count),
      uniqueCount: Number(!result.avg ? 0 : result.uniqueCount),
    };
  });

  return { chart: chartRes, total: totalRes };
}
