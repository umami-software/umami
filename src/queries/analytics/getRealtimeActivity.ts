import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, CLICKHOUSE, PRISMA } from 'lib/db';
import { QueryFilters } from 'lib/types';

export async function getRealtimeActivity(...args: [websiteId: string, filters: QueryFilters]) {
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
    order by website_event.created_at asc
    limit 100
    `,
    params,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters): Promise<{ x: number }> {
  const { rawQuery, parseFilters } = clickhouse;
  const { params, filterQuery, dateQuery } = await parseFilters(websiteId, filters);

  return rawQuery(
    `
        select
            session_id as sessionId,
            event_name as eventName,
            created_at as createdAt,
            browser,
            os,
            device,
            country,
            url_path as urlPath,
            referrer_domain as referrerDomain
        from website_event
        where website_id = {websiteId:UUID}
        ${filterQuery}
        ${dateQuery}
        order by createdAt asc
        limit 100
    `,
    params,
  );
}
