import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE, SESSION_COLUMNS } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getSessionMetrics(
  ...args: [websiteId: string, column: string, filters: QueryFilters, limit?: number]
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
  limit: number = 100,
) {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(
    websiteId,
    {
      ...filters,
      eventType: EVENT_TYPE.pageView,
    },
    {
      joinSession: SESSION_COLUMNS.includes(column),
    },
  );
  const includeCountry = column === 'city' || column === 'subdivision1';

  return rawQuery(
    `
    select 
      ${column} x,
      count(distinct website_event.session_id) y
      ${includeCountry ? ', country' : ''}
    from website_event
    ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = {{eventType}}
    ${filterQuery}
    group by 1 
    ${includeCountry ? ', 3' : ''}
    order by 2 desc
    limit ${limit}`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  column: string,
  filters: QueryFilters,
  limit: number = 100,
): Promise<{ x: string; y: number }[]> {
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });
  const includeCountry = column === 'city' || column === 'subdivision1';

  return rawQuery(
    `
    select
      ${column} x,
      count(distinct session_id) y
      ${includeCountry ? ', country' : ''}
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    group by x 
    ${includeCountry ? ', country' : ''}
    order by y desc
    limit ${limit}
    `,
    params,
  ).then(a => {
    return Object.values(a).map(a => {
      return { x: a.x, y: Number(a.y), country: a.country };
    });
  });
}
