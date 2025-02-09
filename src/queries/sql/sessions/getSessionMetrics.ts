import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS, EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export async function getSessionMetrics(
  ...args: [
    websiteId: string,
    type: string,
    filters: QueryFilters,
    limit?: number | string,
    offset?: number | string,
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  type: string,
  filters: QueryFilters,
  limit: number | string = 500,
  offset: number | string = 0,
) {
  const column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(
    websiteId,
    {
      ...filters,
      eventType: EVENT_TYPE.pageView,
    },
    {
      joinSession: SESSION_COLUMNS.includes(type),
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
    limit ${limit}
    offset ${offset}
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  type: string,
  filters: QueryFilters,
  limit: number | string = 500,
  offset: number | string = 0,
): Promise<{ x: string; y: number }[]> {
  const column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
  });
  const includeCountry = column === 'city' || column === 'subdivision1';

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
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
    offset ${offset}
    `;
  } else {
    sql = `
    select
      ${column} x,
      uniq(session_id) y
      ${includeCountry ? ', country' : ''}
    from website_event_stats_hourly website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    group by x 
    ${includeCountry ? ', country' : ''}
    order by y desc
    limit ${limit}
    offset ${offset}
    `;
  }

  return rawQuery(sql, params);
}
