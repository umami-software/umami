import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/load';
import { maxDate } from 'lib/date';

export interface SessionStatsCriteria {
  startDate: Date;
  endDate: Date;
  timezone?: string;
  unit?: string;
  filters: {
    url?: string;
    referrer?: string;
    title?: string;
    browser?: string;
    os?: string;
    device?: string;
    screen?: string;
    language?: string;
    country?: string;
    region?: string;
    city?: string;
  };
}

export async function getSessionStats(
  ...args: [websiteId: string, criteria: SessionStatsCriteria]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, criteria: SessionStatsCriteria) {
  const { startDate, endDate, timezone = 'utc', unit = 'day', filters = {} } = criteria;
  const { getDateQuery, parseFilters, rawQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const { filterQuery, joinSession } = parseFilters(filters);

  return rawQuery(
    `
    select
      ${getDateQuery('website_event.created_at', unit, timezone)} x,
      count(distinct website_event.session_id) y
    from website_event
      ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_type = {{eventType}}
      ${filterQuery}
    group by 1
    `,
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: EVENT_TYPE.pageView,
      domain: website.domain,
    },
  );
}

async function clickhouseQuery(websiteId: string, criteria: SessionStatsCriteria) {
  const { startDate, endDate, timezone = 'UTC', unit = 'day', filters = {} } = criteria;
  const { parseFilters, rawQuery, getDateStringQuery, getDateQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const { filterQuery } = parseFilters(filters);

  return rawQuery(
    `
    select
      ${getDateStringQuery('g.t', unit)} as x, 
      g.y as y
    from (
      select 
        ${getDateQuery('created_at', unit, timezone)} as t,
        count(distinct session_id) as y
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime} and {endDate:DateTime}
        and event_type = {eventType:UInt32}
        ${filterQuery}
      group by t
    ) as g
    order by t
    `,
    {
      ...filters,
      websiteId,
      startDate: maxDate(startDate, website.resetAt),
      endDate,
      eventType: EVENT_TYPE.pageView,
      domain: website.domain,
    },
  );
}
