import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export async function getWebsiteSessionStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<
  { pageviews: number; visitors: number; visits: number; countries: number; events: number }[]
> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<
  { pageviews: number; visitors: number; visits: number; countries: number; events: number }[]
> {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, cohortQuery, params } = await parseFilters(websiteId, {
    ...filters,
  });

  return rawQuery(
    `
    select
      count(*) filter (where website_event.event_type = 1) as "pageviews",
      count(distinct website_event.session_id) filter (where website_event.event_type = 1) as "visitors",
      count(distinct website_event.visit_id) filter (where website_event.event_type = 1) as "visits",
      count(distinct session.country) filter (where website_event.event_type = 1) as "countries",
      count(*) filter (where website_event.event_type = 2) as "events"
    from website_event
    ${cohortQuery}
    join session on website_event.session_id = session.session_id
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<
  { pageviews: number; visitors: number; visits: number; countries: number; events: number }[]
> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, params } = await parseFilters(websiteId, {
    ...filters,
  });

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      sumIf(1, event_type = 1) as "pageviews",
      uniqIf(session_id, event_type = 1) as "visitors",
      uniqIf(visit_id, event_type = 1) as "visits",
      uniqIf(country, event_type = 1) as "countries",
      sumIf(1, event_type = 2) as "events"
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
  `;
  } else {
    sql = `
    select
      sumIf(views, event_type = 1) as "pageviews",
      uniqIf(session_id, event_type = 1) as "visitors",
      uniqIf(visit_id, event_type = 1) as "visits",
      uniqIf(country, event_type = 1) as "countries",
      sumIf(1, event_type = 2) as "events"
    from website_event_stats_hourly website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
  `;
  }

  return rawQuery(sql, params);
}
