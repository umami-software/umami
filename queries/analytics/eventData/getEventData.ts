import cache from 'lib/cache';
import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { WebsiteEventDataMetric } from 'lib/types';

export async function getEventData(
  ...args: [
    websiteId: string,
    data: {
      startDate: Date;
      endDate: Date;
      eventName: string;
      urlPath?: string;
      filters: [
        {
          eventKey?: string;
          eventValue?: string | number | boolean | Date;
        },
      ];
    },
  ]
): Promise<WebsiteEventDataMetric[]> {
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
    timeSeries?: {
      unit: string;
      timezone: string;
    };
    eventName: string;
    urlPath?: string;
    filters: [
      {
        eventKey?: string;
        eventValue?: string | number | boolean | Date;
      },
    ];
  },
) {
  const { startDate, endDate, timeSeries, eventName, urlPath, filters } = data;
  const { toUuid, rawQuery, getEventDataFilterQuery, getDateQuery } = prisma;
  const params: any = [websiteId, startDate, endDate, eventName || ''];

  return rawQuery(
    `select
        count(*) x
        ${eventName ? `,event_name eventName` : ''}
        ${urlPath ? `,url_path urlPath` : ''}
        ${
          timeSeries ? `,${getDateQuery('created_at', timeSeries.unit, timeSeries.timezone)} t` : ''
        }
    from event_data
      ${
        eventName || urlPath
          ? 'join website_event on event_data.id = website_event.website_event_id'
          : ''
      }
    where website_id = $1${toUuid()}
      and created_at between $2 and $3
      ${eventName ? `and eventName = $4` : ''}
      ${getEventDataFilterQuery(filters, params)}
      ${timeSeries ? 'group by t' : ''}`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: {
    startDate: Date;
    endDate: Date;
    timeSeries?: {
      unit: string;
      timezone: string;
    };
    eventName?: string;
    urlPath?: string;
    filters: [
      {
        eventKey?: string;
        eventValue?: string | number | boolean | Date;
      },
    ];
  },
) {
  const { startDate, endDate, timeSeries, eventName, urlPath, filters } = data;
  const { rawQuery, getBetweenDates, getDateQuery, getEventDataFilterQuery } = clickhouse;
  const website = await cache.fetchWebsite(websiteId);
  const params = { websiteId, revId: website?.revId || 0 };

  return rawQuery(
    `select
        count(*) x
        ${eventName ? `,event_name eventName` : ''}
        ${urlPath ? `,url_path urlPath` : ''}
        ${
          timeSeries ? `,${getDateQuery('created_at', timeSeries.unit, timeSeries.timezone)} t` : ''
        }
    from event_data
    where website_id = {websiteId:UUID}
      and rev_id = {revId:UInt32}
      ${eventName ? `and eventName = ${eventName}` : ''}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${getEventDataFilterQuery(filters, params)}
      ${timeSeries ? 'group by t' : ''}`,
    params,
  );
}
