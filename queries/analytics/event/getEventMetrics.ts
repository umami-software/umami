import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';
import { WebsiteEventMetric } from 'lib/types';
import { EVENT_TYPE } from 'lib/constants';

export async function getEventMetrics(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      timezone: string;
      unit: string;
      filters: {
        url: string;
        eventName: string;
      };
    },
  ]
): Promise<WebsiteEventMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    filters,
  }: {
    startDate: Date;
    endDate: Date;
    timezone: string;
    unit: string;
    filters: {
      url: string;
      eventName: string;
    };
  },
) {
  const { toUuid, rawQuery, getDateQuery, getFilterQuery } = prisma;
  const params: any = [websiteId, startDate, endDate];

  return rawQuery(
    `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id = $1${toUuid()}
      and created_at between $2 and $3
      and event_type = ${EVENT_TYPE.customEvent}
      ${getFilterQuery(filters, params)}
    group by 1, 2
    order by 2`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    filters,
  }: {
    startDate: Date;
    endDate: Date;
    timezone: string;
    unit: string;
    filters: {
      url: string;
      eventName: string;
    };
  },
) {
  const { rawQuery, getDateQuery, getBetweenDates, getFilterQuery } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = { websiteId, revId: website?.revId || 0 };

  return rawQuery(
    `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from event
    where website_id = {websiteId:UUID}
    and rev_id = {revId:UInt32}
      and event_type = ${EVENT_TYPE.customEvent}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${getFilterQuery(filters, params)}
    group by x, t
    order by t`,
    params,
  );
}
