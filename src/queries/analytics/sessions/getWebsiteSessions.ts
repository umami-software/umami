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
      s.session_id as "id",
      s.website_id as "websiteId",
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      subdivision1,
      city,
      min(we.created_at) as "firstAt",
      max(we.created_at) as "lastAt",
      count(distinct we.visit_id) as "visits",
      sum(case when we.event_type = 1 then 1 else 0 end) as "views",
      max(we.created_at) as "createdAt"
    from website_event we
    join session s on s.session_id = we.session_id
    where we.website_id = {{websiteId::uuid}}
        and we.created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    group by s.session_id, s.website_id, s.hostname, s.browser, s.os, s.device, s.screen, s.language, s.country, s.subdivision1, s.city
    order by max(we.created_at) desc
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
