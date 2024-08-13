import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';
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
  const { pagedQuery } = prisma;

  const where = {
    ...filters,
    id: websiteId,
  };

  return pagedQuery('session', { where }, pageParams);
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters, pageParams?: PageParams) {
  const { pagedQuery, parseFilters } = clickhouse;
  const { params, dateQuery, filterQuery } = await parseFilters(websiteId, filters);

  return pagedQuery(
    `
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
      min(min_time) as firstAt,
      max(max_time) as lastAt,
      uniq(visit_id) as visits,
      sumIf(views, event_type = 1) as views
    from website_event_stats_hourly
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    group by session_id, website_id, hostname, browser, os, device, screen, language, country, subdivision1, city
    order by lastAt desc
    `,
    params,
    pageParams,
  ).then((result: any) => {
    return {
      ...result,
      data: result.data.map((row: any) => {
        return {
          ...row,
          createdAt: row.lastAt,
          visits: Number(row.visits),
          views: Number(row.views),
        };
      }),
    };
  });
}
