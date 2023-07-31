import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { WebsiteEventMetric } from 'lib/types';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/load';
import { maxDate } from 'lib/date';

export interface GetEventMetricsCriteria {
  startDate: Date;
  endDate: Date;
  timezone: string;
  unit: string;
  filters: {
    url: string;
    eventName: string;
  };
}

export async function getEventMetrics(
  ...args: [websiteId: string, criteria: GetEventMetricsCriteria]
): Promise<WebsiteEventMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, criteria: GetEventMetricsCriteria) {
  const { startDate, endDate, timezone = 'utc', unit = 'day', filters } = criteria;
  const { rawQuery, getDateQuery, getFilterQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const filterQuery = getFilterQuery(filters);

  return rawQuery(
    `
    select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and event_type = {{eventType}}
      ${filterQuery}
    group by 1, 2
    order by 2
    `,
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: EVENT_TYPE.customEvent,
    },
  );
}

async function clickhouseQuery(websiteId: string, criteria: GetEventMetricsCriteria) {
  const { startDate, endDate, timezone = 'utc', unit = 'day', filters } = criteria;
  const { rawQuery, getDateQuery, getFilterQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const filterQuery = getFilterQuery(filters);

  return rawQuery(
    `
    select
      event_name x,
      ${getDateQuery('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime} and {endDate:DateTime}
      and event_type = {eventType:UInt32}
      ${filterQuery}
    group by x, t
    order by t
    `,
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: EVENT_TYPE.customEvent,
    },
  );
}
