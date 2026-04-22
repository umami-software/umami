import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getRealtimeActivity';

export async function getRealtimeActivity(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
  });

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
        website_event.referrer_domain as "referrerDomain",
        website_event.hostname
    from website_event
    ${cohortQuery}
    inner join session
      on session.session_id = website_event.session_id
        and session.website_id = website_event.website_id
    where website_event.website_id = {{websiteId::uuid}}
    ${filterQuery}
    ${dateQuery}
    order by website_event.created_at desc
    limit 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters): Promise<{ x: number }> {
  const { rawQuery, parseFilters } = clickhouse;
  const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
  });

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
            referrer_domain as referrerDomain,
            hostname
        from website_event
        ${cohortQuery}
        where website_id = {websiteId:UUID}
        ${filterQuery}
        ${dateQuery}
        order by createdAt desc
        limit 100
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = oceanbase;
  const { filterQuery, cohortQuery, dateQuery, buildParams, getDateParams } = parseFilters({
    ...filters,
    websiteId,
  });

  // dateQuery appears after filterQuery, so add date params at the end
  const params = [...buildParams([websiteId]), ...getDateParams()];

  return rawQuery(
    `
    SELECT
        website_event.session_id AS sessionId,
        website_event.event_name AS eventName,
        website_event.created_at AS createdAt,
        session.browser,
        session.os,
        session.device,
        session.country,
        website_event.url_path AS urlPath,
        website_event.referrer_domain AS referrerDomain,
        website_event.hostname
    FROM website_event
    ${cohortQuery}
    INNER JOIN session
      ON session.session_id = website_event.session_id
        AND session.website_id = website_event.website_id
    WHERE website_event.website_id = ?
    ${filterQuery}
    ${dateQuery}
    ORDER BY website_event.created_at DESC
    LIMIT 100
    `,
    params,
    FUNCTION_NAME,
  );
}
