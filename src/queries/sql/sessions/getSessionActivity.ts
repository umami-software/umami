import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionActivity';

export async function getSessionActivity(
  ...args: [websiteId: string, sessionIds: string[], filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, sessionIds: string[], filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { startDate, endDate, lockedFilters, timezone } = filters;
  const {
    joinSessionQuery = '',
    filterQuery = '',
    queryParams = {},
  } = lockedFilters
    ? parseFilters({
        lockedFilters,
        startDate,
        endDate,
        timezone,
      })
    : {};

  return rawQuery(
    `
    select
      website_event.created_at as "createdAt",
      website_event.url_path as "urlPath",
      website_event.url_query as "urlQuery",
      website_event.referrer_domain as "referrerDomain",
      website_event.event_id as "eventId",
      website_event.event_type as "eventType",
      website_event.event_name as "eventName",
      website_event.visit_id as "visitId",
      website_event.hostname,
      EXISTS (select 1
              from event_data d
              where d.website_event_id = website_event.event_id
                and d.website_id = {{websiteId::uuid}}
                and d.created_at between {{startDate}} and {{endDate}}) AS "hasData"
    from website_event
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.session_id = any({{sessionIds}}::uuid[])
      and website_event.event_type != ${EVENT_TYPE.performance}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    order by website_event.created_at desc
    limit 500
    `,
    { websiteId, sessionIds, startDate, endDate, ...queryParams },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, sessionIds: string[], filters: QueryFilters) {
  const { rawQuery, parseFilters } = clickhouse;
  const { startDate, endDate, lockedFilters, timezone } = filters;
  const { filterQuery = '', queryParams = {} } = lockedFilters
    ? parseFilters({
        lockedFilters,
        startDate,
        endDate,
        timezone,
      })
    : {};

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
                    and session_id in {sessionIds:Array(UUID)}
                    and created_at between {startDate:DateTime64} and {endDate:DateTime64}) AS hasData
    from website_event
    where website_id = {websiteId:UUID}
      and session_id in {sessionIds:Array(UUID)}
      and event_type != ${EVENT_TYPE.performance}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
    order by created_at desc
    limit 500
    `,
    { websiteId, sessionIds, startDate, endDate, ...queryParams },
    FUNCTION_NAME,
  );
}
