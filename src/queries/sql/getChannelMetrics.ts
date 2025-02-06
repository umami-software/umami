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
  const { params, filterQuery, dateQuery } = await parseFilters(websiteId, filters);

  return rawQuery(
    `
    select
        website_event.session_id as "sessionId",
        website_event.event_name as "eventName",
        website_event.created_at as "createdAt",
        session.browser,
        session.os,
        session.device,
        session.country,
        website_event.url_path as "urlPath",
        website_event.referrer_domain as "referrerDomain"
    from website_event
    inner join session
      on session.session_id = website_event.session_id
    where website_event.website_id = {{websiteId::uuid}}
    ${filterQuery}
    ${dateQuery}
    order by website_event.created_at desc
    limit 100
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { params, filterQuery, dateQuery } = await parseFilters(websiteId, filters);

  const sql = `
        select
            referrer_domain as x,
            count(*) as y
        from website_event
        where website_id = {websiteId:UUID}
        ${filterQuery}
        ${dateQuery}
        group by 1
        order by y desc
    `;

  return rawQuery(sql, params).then(a => {
    return Object.values(a).map(a => {
      return { x: a.x, y: Number(a.y) };
    });
  });
}
