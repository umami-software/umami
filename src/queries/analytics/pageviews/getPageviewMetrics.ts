import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE, SESSION_COLUMNS } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getPageviewMetrics(
  ...args: [websiteId: string, columns: string, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, column: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(
    websiteId,
    {
      ...filters,
      eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
    },
    { joinSession: SESSION_COLUMNS.includes(column) },
  );

  let excludeDomain = '';
  if (column === 'referrer_domain') {
    excludeDomain =
      'and (website_event.referrer_domain != {{websiteDomain}} or website_event.referrer_domain is null)';
  }

  return rawQuery(
    `
    select ${column} x, count(*) y
    from website_event
    ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_type = {{eventType}}
      ${excludeDomain}
      ${filterQuery}
    group by 1
    order by 2 desc
    limit 100
    `,
    params,
  );
}

async function clickhouseQuery(websiteId: string, column: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  });

  let excludeDomain = '';
  if (column === 'referrer_domain') {
    excludeDomain = 'and referrer_domain != {websiteDomain:String}';
  }

  return rawQuery(
    `
    select ${column} x, count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime} and {endDate:DateTime}
      and event_type = {eventType:UInt32}
      ${excludeDomain}
      ${filterQuery}
    group by x
    order by y desc
    limit 100
    `,
    params,
  );
}
