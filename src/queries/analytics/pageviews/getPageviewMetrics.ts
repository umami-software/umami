import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from 'lib/constants';
import { QueryFilters } from 'lib/types';

export async function getPageviewMetrics(
  ...args: [
    websiteId: string,
    column: string,
    filters: QueryFilters,
    limit?: number,
    offset?: number,
    fieldName?: string,
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
  limit: number = 500,
  offset: number = 0,
  fieldName?: string,
) {
  const column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, joinSession, params } = await parseFilters(
    websiteId,
    {
      ...filters,
      eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
    },
    { joinSession: SESSION_COLUMNS.includes(type) },
  );

  let excludeDomain = '';
  let joinEventData = '';
  let filterEventDataOnFieldName = '';
  if (column === 'referrer_domain') {
    excludeDomain =
      'and (website_event.referrer_domain != {{websiteDomain}} or website_event.referrer_domain is null)';
  } else if (column === 'custom') {
    joinEventData = 'join event_data on event_data.website_event_id = website_event.event_id';
    filterEventDataOnFieldName = 'and event_data.event_key = {{fieldName}}';
  }

  return rawQuery(
    `
    select ${column === 'custom' ? `event_data.string_value` : column} x, count(*) y
    from website_event
    ${joinEventData}
    ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_type = {{eventType}}
      ${filterEventDataOnFieldName}
      ${excludeDomain}
      ${filterQuery}
    group by 1
    order by 2 desc
    limit ${limit}
    offset ${offset}
    `,
    { ...params, fieldName },
  );
}

async function clickhouseQuery(
  websiteId: string,
  type: string,
  filters: QueryFilters,
  limit: number = 500,
  offset: number = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fieldName?: string,
): Promise<{ x: string; y: number }[]> {
  const column = FILTER_COLUMNS[type] || type;
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
