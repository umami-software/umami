import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionActivity';

export async function getSessionActivity(
  ...args: [websiteId: string, sessionId: string, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, sessionId: string, filters: QueryFilters) {
  const { rawQuery } = prisma;
  const { startDate, endDate } = filters;

  return rawQuery(
    `
    select
      created_at as "createdAt",
      url_path as "urlPath",
      url_query as "urlQuery",
      referrer_domain as "referrerDomain",
      event_id as "eventId",
      event_type as "eventType",
      event_name as "eventName",
      visit_id as "visitId",
      hostname,
      event_id IN (select website_event_id 
                   from event_data
                   where website_id = {{websiteId::uuid}}
                      and created_at between {{startDate}} and {{endDate}}) AS "hasData"
    from website_event
    where website_id = {{websiteId::uuid}}
      and session_id = {{sessionId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    order by created_at desc
    limit 500
    `,
    { websiteId, sessionId, startDate, endDate },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, sessionId: string, filters: QueryFilters) {
  const { rawQuery } = clickhouse;
  const { startDate, endDate } = filters;

  return rawQuery(
    `
    select
      created_at as createdAt,
      url_path as urlPath,
      url_query as urlQuery,
      referrer_domain as referrerDomain,
      event_id as eventId,
      event_type as eventType,
      event_name as eventName,
      visit_id as visitId,
      hostname,
      event_id IN (select event_id
                   from event_data
                   where website_id = {websiteId:UUID}
                    and session_id = {sessionId:UUID}
                    and created_at between {startDate:DateTime64} and {endDate:DateTime64}) AS hasData
    from website_event
    where website_id = {websiteId:UUID}
      and session_id = {sessionId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    order by created_at desc
    limit 500
    `,
    { websiteId, sessionId, startDate, endDate },
    FUNCTION_NAME,
  );
}

async function oceanbaseQuery(websiteId: string, sessionId: string, filters: QueryFilters) {
  const { rawQuery } = oceanbase;
  const { startDate, endDate } = filters;

  return rawQuery(
    `
    SELECT
      created_at AS createdAt,
      url_path AS urlPath,
      url_query AS urlQuery,
      referrer_domain AS referrerDomain,
      event_id AS eventId,
      event_type AS eventType,
      event_name AS eventName,
      visit_id AS visitId,
      hostname,
      event_id IN (SELECT website_event_id
                   FROM event_data
                   WHERE website_id = ?
                      AND created_at BETWEEN ? AND ?) AS hasData
    FROM website_event
    WHERE website_id = ?
      AND session_id = ?
      AND created_at BETWEEN ? AND ?
    ORDER BY created_at DESC
    LIMIT 500
    `,
    [websiteId, startDate, endDate, websiteId, sessionId, startDate, endDate],
    FUNCTION_NAME,
  );
}
