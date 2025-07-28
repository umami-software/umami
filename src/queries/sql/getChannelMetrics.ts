import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from '@/lib/db';
import { QueryFilters } from '@/lib/types';

export async function getChannelMetrics(...args: [websiteId: string, filters?: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { params, filterQuery, cohortQuery, dateQuery } = await parseFilters(websiteId, filters);

  return rawQuery(
    `
    select
      referrer_domain as domain,
      url_query as query,
      count(distinct session_id) as visitors
    from website_event
    ${cohortQuery}
    where website_id = {{websiteId::uuid}}
        ${filterQuery}
        ${dateQuery}
    group by 1, 2
    order by visitors desc
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { params, filterQuery, cohortQuery, dateQuery } = await parseFilters(websiteId, filters);

  const sql = `
    select
      referrer_domain as domain,
      url_query as query,
      uniq(session_id) as visitors
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
    ${filterQuery}
    ${dateQuery}
    group by 1, 2
    order by visitors desc
  `;

  return rawQuery(sql, params);
}
