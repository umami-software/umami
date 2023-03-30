import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';
import { Prisma } from '@prisma/client';
import { EVENT_TYPE } from 'lib/constants';
import { getWebsite } from 'queries';

export async function getPageviewMetrics(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      column: Prisma.WebsiteEventScalarFieldEnum | Prisma.SessionScalarFieldEnum;
      filters: object;
      type: string;
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
  data: {
    startDate: Date;
    endDate: Date;
    column: Prisma.WebsiteEventScalarFieldEnum | Prisma.SessionScalarFieldEnum;
    filters: object;
    type: string;
  },
) {
  const { startDate, endDate, column, filters = {}, type } = data;
  const { rawQuery, parseFilters, toUuid } = prisma;
  const website = await getWebsite({ id: websiteId });
  const resetDate = website?.resetAt || website?.createdAt;
  const params: any = [
    websiteId,
    resetDate,
    startDate,
    endDate,
    type === 'event' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  ];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from website_event
      ${joinSession}
    where website_event.website_id = $1${toUuid()}
      and website_event.created_at >= $2
      and website_event.created_at between $3 and $4
      and event_type = $5
      ${filterQuery}
    group by 1
    order by 2 desc
    limit 100`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    column: Prisma.WebsiteEventScalarFieldEnum | Prisma.SessionScalarFieldEnum;
    filters: object;
    type: string;
  },
) {
  const { startDate, endDate, column, filters = {}, type } = data;
  const { rawQuery, getDateFormat, parseFilters, getBetweenDates } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const resetDate = website?.resetAt || website?.createdAt;
  const params = {
    websiteId,
    eventType: type === 'event' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  };
  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and event_type = {eventType:UInt32}
      and created_at >= ${getDateFormat(resetDate)}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${filterQuery}
    group by x
    order by y desc
    limit 100`,
    params,
  );
}
