import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getEventData(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId,
  { startDate, endDate, timezone = 'utc', unit = 'day', event_name, columns, filters },
) {
  const { rawQuery, getDateQuery, getEventDataColumnsQuery, getEventDataFilterQuery } = prisma;
  const params = [startDate, endDate];

  return rawQuery(
    `select
      ${getDateQuery('event.created_at', unit, timezone)} t,
      ${getEventDataColumnsQuery('event_data.event_data', columns)}
    from event
      join website 
        on event.website_id = website.website_id
      join event_data
        on event.event_id = event_data.event_id
    where website_uuid='${websiteId}'
      and event.created_at between $1 and $2
      ${event_name ? `and event_name = ${event_name}` : ''}
      ${filters ? `and ${getEventDataFilterQuery('event_data.event_data', filters)}` : ''}
    group by 1
    order by 2`,
    params,
  );
}

async function clickhouseQuery(
  websiteId,
  { startDate, endDate, timezone = 'UTC', unit = 'day', event_name, columns, filters },
) {
  const {
    rawQuery,
    getDateQuery,
    getBetweenDates,
    getEventDataColumnsQuery,
    getEventDataFilterQuery,
  } = clickhouse;
  const params = [websiteId];

  return rawQuery(
    `select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      ${getEventDataColumnsQuery('event_data', columns)}
    from event
    where website_id= $1
      ${event_name ? `and event_name = ${event_name}` : ''}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${filters ? `and ${getEventDataFilterQuery('event_data', filters)}` : ''}
    group by x, t
    order by t`,
    params,
  );
}
