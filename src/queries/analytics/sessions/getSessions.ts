import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';
import { PageParams, QueryFilters } from 'lib/types';

export async function getSessions(
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
      created_at as createdAt,
      toUnixTimestamp(created_at) as timestamp,
      hostname,
      browser,
      os,
      device,
      screen,
      language,
      country,
      subdivision1,
      subdivision2,
      city
    from website_event
    where website_id = {websiteId:UUID}
    ${dateQuery}
    ${filterQuery}
    order by created_at desc
    `,
    params,
    pageParams,
  );
}
