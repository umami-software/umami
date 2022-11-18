import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';
import { WebsiteEventMetric } from 'interface/api/models';
import { UmamiApi } from 'interface/enum';

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
  const { rawQuery, getDateQuery, getFilterQuery } = prisma;
  const params = [startDate, endDate];

  return rawQuery(
    `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id='${websiteId}'
      and created_at between $1 and $2
      and event_type = ${UmamiApi.EventType.Event}
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
  const params = [websiteId, website?.revId || 0];

  return rawQuery(
    `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from event
    where website_id = $1
      and rev_id = $2
      and event_type = ${UmamiApi.EventType.Event}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${getFilterQuery(filters, params)}
    group by x, t
    order by t`,
    params,
  );
}
