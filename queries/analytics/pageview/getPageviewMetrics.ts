import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import cache from 'lib/cache';
import { Prisma } from '@prisma/client';
import { EVENT_TYPE } from 'lib/constants';

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
  const { rawQuery, parseFilters } = prisma;
  const params: any = [
    startDate,
    endDate,
    type === 'event' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  ];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from website_event
      ${joinSession}
    where website_id='${websiteId}'
      and website_event.created_at between $1 and $2
      and event_type = $3
      ${filterQuery}
    group by 1
    order by 2 desc`,
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
  const { rawQuery, parseFilters, getBetweenDates } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = [
    websiteId,
    website?.revId || 0,
    type === 'event' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  ];
  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from event
    where website_id = $1
      and rev_id = $2
      and event_type = $3
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${filterQuery}
    group by x
    order by y desc`,
    params,
  );
}
