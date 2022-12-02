import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import cache from 'lib/cache';
import { WebsiteMetric } from 'interface/api/models';
import { EventType } from 'lib/types';

export async function getEventData(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      eventName: string;
      columns: any;
      filters: object;
    },
  ]
): Promise<WebsiteMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  }).then(results => {
    return Object.keys(results[0]).map(a => {
      return { x: a, y: results[0][`${a}`] };
    });
  });
}

async function relationalQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    eventName: string;
    columns: any;
    filters: object;
  },
) {
  const { startDate, endDate, eventName, columns, filters } = data;
  const { rawQuery, getEventDataColumnsQuery, getEventDataFilterQuery } = prisma;
  const params = [startDate, endDate];

  return rawQuery(
    `select
      ${getEventDataColumnsQuery('event_data', columns)}
    from website_event
    where website_id ='${websiteId}'
      and created_at between $1 and $2
      and event_type = ${EventType.Event}
      ${eventName ? `and eventName = ${eventName}` : ''}
      ${
        Object.keys(filters).length > 0
          ? `and ${getEventDataFilterQuery('event_data', filters)}`
          : ''
      }`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    eventName: string;
    columns: any;
    filters: object;
  },
) {
  const { startDate, endDate, eventName, columns, filters } = data;
  const { rawQuery, getBetweenDates, getEventDataColumnsQuery, getEventDataFilterQuery } =
    clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = [websiteId, website?.revId || 0];

  return rawQuery(
    `select
      ${getEventDataColumnsQuery('event_data', columns)}
    from event
    where website_id = $1
      and rev_id = $2
      and event_type = ${EventType.Event}
      ${eventName ? `and eventName = ${eventName}` : ''}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${
        Object.keys(filters).length > 0
          ? `and ${getEventDataFilterQuery('event_data', filters)}`
          : ''
      }`,
    params,
  );
}
