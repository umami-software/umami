import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { DEFAULT_RESET_DATE, EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/query';

export async function getPageviewMetrics(
  ...args: [
    websiteId: string,
    criteria: {
      startDate: Date;
      endDate: Date;
      column: string;
      filters: object;
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
    column: string;
    filters: object;
  },
) {
  const { startDate, endDate, filters = {}, column } = criteria;
  const { rawQuery, parseFilters, toUuid } = prisma;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_RESET_DATE);
  const params: any = [
    websiteId,
    resetDate,
    startDate,
    endDate,
    column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
  ];

  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain =
      'and (website_event.referrer_domain != $6 or website_event.referrer_domain is null)';
    params.push(website.domain);
  }

  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from website_event
      ${joinSession}
    where website_event.website_id = $1${toUuid()}
      and website_event.created_at >= $2
      and website_event.created_at between $3 and $4
      and event_type = $5
      ${excludeDomain}
      ${filterQuery}
    group by 1
    order by 2 desc
    limit 100`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  criteria: {
    startDate: Date;
    endDate: Date;
    column: string;
    filters: object;
  },
) {
  const { startDate, endDate, filters = {}, column } = criteria;
  const { rawQuery, getDateFormat, parseFilters } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_RESET_DATE);
  const params = {
    websiteId,
    eventType: column === 'event_name' ? EVENT_TYPE.customEvent : EVENT_TYPE.pageView,
    domain: undefined,
  };

  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = 'and referrer_domain != {domain:String}';
    params.domain = website.domain;
  }

  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from website_event
    where website_id = {websiteId:UUID}
      and event_type = {eventType:UInt32}
      and created_at >= ${getDateFormat(resetDate)}
      and created_at between ${getDateFormat(startDate)} and ${getDateFormat(endDate)} 
      ${excludeDomain}
      ${filterQuery}
    group by x
    order by y desc
    limit 100`,
    params,
  );
}
