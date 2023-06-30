import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { WebsiteEventMetric } from 'lib/types';
import { DEFAULT_CREATED_AT, EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/query';

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
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);
  const params: any = [websiteId, resetDate, startDate, endDate];
  const filterQuery = getFilterQuery(filters, params);

  return rawQuery(
    `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id = $1${toUuid()}
      and created_at >= $2
      and created_at between $3 and $4
      and event_type = ${EVENT_TYPE.customEvent}
      ${filterQuery}
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
  const { rawQuery, getDateQuery, getDateFormat, getBetweenDates, getFilterQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);
  const params = { websiteId };

  return rawQuery(
    `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and event_type = ${EVENT_TYPE.customEvent}
      and created_at >= ${getDateFormat(resetDate)}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${getFilterQuery(filters, params)}
    group by x, t
    order by t`,
    params,
  );
}
