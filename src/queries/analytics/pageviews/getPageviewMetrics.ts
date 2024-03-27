import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE, SESSION_COLUMNS } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getPageviewMetrics(
  ...args: [
    websiteId: string,
    column: string,
    filters: QueryFilters,
    limit?: number,
    offset?: number,
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  column: string,
  filters: QueryFilters,
  limit: number = 500,
  offset: number = 0,
) {
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
    limit ${limit}
    offset ${offset}
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  column: string,
  filters: QueryFilters,
  limit: number = 500,
  offset: number = 0,
): Promise<{ x: string; y: number }[]> {
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
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = {eventType:UInt32}
      ${excludeDomain}
      ${filterQuery}
    group by x
    order by y desc
    limit ${limit}
    offset ${offset}
    `,
    params,
  ).then(a => {
    return Object.values(a).map(a => {
      return { x: a.x, y: Number(a.y) };
    });
  });
}
