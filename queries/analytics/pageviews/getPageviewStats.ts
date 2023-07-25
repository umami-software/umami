import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { DEFAULT_RESET_DATE, EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/query';

export async function getPageviewStats(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      timezone?: string;
      unit?: string;
      count?: string;
      filters: object;
      sessionKey?: string;
    },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
    unit?: string;
    count?: string;
    filters: object;
    sessionKey?: string;
  },
) {
  const {
    startDate,
    endDate,
    timezone = 'utc',
    unit = 'day',
    count = '*',
    filters = {},
    sessionKey = 'session_id',
  } = criteria;
  const { getDateQuery, parseFilters, rawQuery } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_RESET_DATE);
  const { filterQuery, joinSession } = parseFilters(filters);

  return rawQuery(
    `
    select
      ${getDateQuery('website_event.created_at', unit, timezone)} x,
      count(${count !== '*' ? `${count}${sessionKey}` : count}) y
    from website_event
      ${joinSession}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at >= {{resetDate}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and event_type = ${EVENT_TYPE.pageView}
      ${filterQuery}
    group by 1
    `,
    { ...filters, websiteId, resetDate, startDate, endDate },
  );
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    timezone?: string;
    unit?: string;
    count?: string;
    filters: object;
    sessionKey?: string;
  },
) {
  const {
    startDate,
    endDate,
    timezone = 'UTC',
    unit = 'day',
    count = '*',
    filters = {},
  } = criteria;
  const { parseFilters, rawQuery, getDateStringQuery, getDateQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_RESET_DATE);
  const { filterQuery } = parseFilters(filters);

  return rawQuery(
    `
    select
      ${getDateStringQuery('g.t', unit)} as x, 
      g.y as y
    from (
      select 
        ${getDateQuery('created_at', unit, timezone)} as t,
        count(${count !== '*' ? 'distinct session_id' : count}) as y
      from website_event
      where website_id = {websiteId:UUID}
        and created_at >= {resetDate:DateTime}
        and created_at between {startDate:DateTime} and {endDate:DateTime}
        and event_type = ${EVENT_TYPE.pageView}
        ${filterQuery}
      group by t
    ) as g
    order by t
    `,
    { ...filters, websiteId, resetDate, startDate, endDate },
  );
}
