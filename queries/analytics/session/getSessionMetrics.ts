import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { DEFAULT_CREATED_AT, EVENT_TYPE } from 'lib/constants';
import { loadWebsite } from 'lib/query';

export async function getSessionMetrics(
  ...args: [
    websiteId: string,
    criteria: { startDate: Date; endDate: Date; column: string; filters: object },
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  criteria: { startDate: Date; endDate: Date; column: string; filters: object },
) {
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);
  const { startDate, endDate, column, filters = {} } = criteria;
  const { toUuid, parseFilters, rawQuery } = prisma;
  const params: any = [websiteId, resetDate, startDate, endDate];
  const { filterQuery, joinSession } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(*) y
    from session as x
    where x.session_id in (
      select website_event.session_id
      from website_event
        join website 
          on website_event.website_id = website.website_id
        ${joinSession}
      where website.website_id = $1${toUuid()}
        and website_event.created_at >= $2
        and website_event.created_at between $3 and $4
      ${filterQuery}
    )
    group by 1
    order by 2 desc
    limit 100`,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  data: { startDate: Date; endDate: Date; column: string; filters: object },
) {
  const { startDate, endDate, column, filters = {} } = data;
  const { getDateFormat, parseFilters, getBetweenDates, rawQuery } = clickhouse;
  const website = await loadWebsite(websiteId);
  const resetDate = new Date(website?.resetAt || DEFAULT_CREATED_AT);
  const params = { websiteId };
  const { filterQuery } = parseFilters(filters, params);

  return rawQuery(
    `select ${column} x, count(distinct session_id) y
    from website_event as x
    where website_id = {websiteId:UUID}
    and event_type = ${EVENT_TYPE.pageView}
      and created_at >= ${getDateFormat(resetDate)}
      and ${getBetweenDates('created_at', startDate, endDate)}
      ${filterQuery}
    group by x
    order by y desc
    limit 100`,
    params,
  );
}
