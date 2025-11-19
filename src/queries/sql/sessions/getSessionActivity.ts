import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionActivity';

export async function getSessionActivity(
  ...args: [websiteId: string, sessionId: string, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
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
