import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/load';
import { maxDate } from 'lib/date';

export async function getPageviewMetrics(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      column: string;
      filters: object;
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
    column: string;
    filters: object;
  },
) {
  const { startDate, endDate, filters = {}, column } = criteria;
  const { rawQuery, parseFilters } = prisma;
  const website = await loadWebsite(websiteId);

  const { filterQuery, joinSession } = parseFilters(filters);

  return rawQuery(
    `
    select ${column} x, count(*) y
    from website_event
      ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_type = {{eventType}}
      ${filterQuery}
    group by 1
    order by 2 desc
    limit 100
    `,
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
      domain: website.domain,
    },
  );
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    column: string;
    filters: object;
  },
) {
  const { startDate, endDate, filters = {}, column } = criteria;
  const { rawQuery, parseFilters } = clickhouse;
  const website = await loadWebsite(websiteId);

  const { filterQuery } = parseFilters(filters);

  return rawQuery(
    `
    select ${column} x, count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime} and {endDate:DateTime}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    group by x
    order by y desc
    limit 100
    `,
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
      domain: website.domain,
    },
  );
}
