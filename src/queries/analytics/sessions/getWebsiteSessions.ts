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
      min(created_at) as firstAt,
      max(created_at) as lastAt,
      uniq(visit_id) as visits
    from website_event
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    group by session_id, website_id, hostname, browser, os, device, screen, language, country, subdivision1, city
    order by lastAt desc
    `,
    params,
    pageParams,
  ).then((result: any) => ({
    ...result,
    visits: Number(result.visits),
  }));
}
