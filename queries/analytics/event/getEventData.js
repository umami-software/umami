import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';

export async function getEventData(...args) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId, { startDate, endDate, event_name, columns, filters }) {
  const { rawQuery, getEventDataColumnsQuery, getEventDataFilterQuery } = prisma;
  const params = [startDate, endDate];

  return rawQuery(
    `select
      ${getEventDataColumnsQuery('event_data.event_data', columns)}
    from event
      join website 
        on event.website_id = website.website_id
      join event_data
        on event.event_id = event_data.event_id
    where website_uuid='${websiteId}'
      and event.created_at between $1 and $2
      ${event_name ? `and event_name = ${event_name}` : ''}
      ${
        Object.keys(filters).length > 0
          ? `and ${getEventDataFilterQuery('event_data.event_data', filters)}`
          : ''
      }`,
    params,
  ).then(results => {
    return Object.keys(results[0]).map(a => {
      return { x: a, y: results[0][`${a}`] };
    });
  });
}

async function clickhouseQuery(websiteId, { startDate, endDate, event_name, columns, filters }) {
  const { rawQuery, getBetweenDates, getEventDataColumnsQuery, getEventDataFilterQuery } =
    clickhouse;
  const params = [websiteId];

  return rawQuery(
    `select
      ${getEventDataColumnsQuery('event_data', columns)}
    from event
    where website_id= $1
      ${event_name ? `and event_name = ${event_name}` : ''}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${
        Object.keys(filters).length > 0
          ? `and ${getEventDataFilterQuery('event_data', filters)}`
          : ''
      }`,
    params,
  ).then(results => {
    return Object.keys(results[0]).map(a => {
      return { x: a, y: results[0][`${a}`] };
    });
  });
}
