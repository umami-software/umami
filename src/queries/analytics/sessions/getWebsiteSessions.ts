import clickhouse from 'lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from 'lib/db';
import prisma from 'lib/prisma';
import { PageParams, QueryFilters } from 'lib/types';

export async function getWebsiteSessions(
  ...args: [websiteId: string, filters?: QueryFilters, pageParams?: PageParams]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters, pageParams: PageParams) {
  const { pagedRawQuery, parseFilters } = prisma;
  const { filterQuery, params } = await parseFilters(websiteId, {
    ...filters,
  });

  return pagedRawQuery(
    `
    with sessions as (
    select
      session.session_id as "id",
      session.website_id as "websiteId",
      session.hostname,
      session.browser,
      session.os,
      session.device,
      session.screen,
      session.language,
      session.country,
      session.subdivision1,
      session.city,
      min(website_event.created_at) as "firstAt",
      max(website_event.created_at) as "lastAt",
      count(distinct website_event.visit_id) as "visits",
      sum(case when website_event.event_type = 1 then 1 else 0 end) as "views",
      max(website_event.created_at) as "createdAt"
    from website_event 
    join session on session.session_id = website_event.session_id
    where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    group by session.session_id, 
      session.website_id, 
      session.hostname, 
      session.browser, 
      session.os, 
      session.device, 
      session.screen, 
      session.language, 
      session.country, 
      session.subdivision1, 
      session.city
    order by max(website_event.created_at) desc
    limit 1000)
    select * from sessions
    `,
    params,
    pageParams,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters, pageParams?: PageParams) {
  const { pagedQuery, parseFilters, getDateStringSQL } = clickhouse;
  const { params, dateQuery, filterQuery } = await parseFilters(websiteId, filters);

  return pagedQuery(
    `
    with sessions as (
    select
      session_id as id,
      website_id as websiteId,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      subdivision1,
      city,
      ${getDateStringSQL('min(min_time)')} as firstAt,
      ${getDateStringSQL('max(max_time)')} as lastAt,
      uniq(visit_id) as visits,
      sumIf(views, event_type = 1) as views,
      lastAt as createdAt
    from website_event_stats_hourly
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    group by session_id, website_id, hostname, browser, os, device, screen, language, country, subdivision1, city
    order by lastAt desc
    limit 1000)
    select * from sessions
    `,
    params,
    pageParams,
  );
}
