import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionReplays';

export function getSessionReplays(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = prisma;
  const { search } = filters;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    search: search ? `%${search}%` : undefined,
  });

  const joinQuery =
    filterQuery || cohortQuery
      ? `join (select *
               from website_event
               where website_id = {{websiteId::uuid}}
                  and created_at between {{startDate}} and {{endDate}}) website_event
        on website_event.website_id = sr.website_id
          and website_event.session_id = sr.session_id`
      : '';

  const searchQuery = search
    ? `and (session.distinct_id ilike {{search}}
           or session.city ilike {{search}}
           or session.browser ilike {{search}}
           or session.os ilike {{search}}
           or session.device ilike {{search}})`
    : '';

  return pagedRawQuery(
    `
    select
      sr.session_id as "id",
      sr.website_id as "websiteId",
      session.browser,
      session.os,
      session.device,
      session.country,
      session.city,
      sum(sr.event_count) as "eventCount",
      count(sr.replay_id) as "chunkCount",
      min(sr.started_at) as "startedAt",
      max(sr.ended_at) as "endedAt",
      sum(extract(epoch from sr.ended_at - sr.started_at) * 1000)::bigint as "duration",
      max(sr.created_at) as "createdAt"
    from session_replay sr
    join session on session.session_id = sr.session_id
      and session.website_id = sr.website_id
    ${cohortQuery}
    ${joinQuery}
    where sr.website_id = {{websiteId::uuid}}
      and sr.created_at between {{startDate}} and {{endDate}}
    ${filterQuery}
    ${searchQuery}
    group by sr.session_id,
      sr.website_id,
      session.browser,
      session.os,
      session.device,
      session.country,
      session.city
    order by max(sr.created_at) desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { pagedRawQuery, parseFilters } = clickhouse;
  const { search } = filters;
  const { queryParams, cohortQuery, filterQuery } = parseFilters({
    ...filters,
    websiteId,
  });

  const searchQuery = search
    ? `and ((positionCaseInsensitive(distinct_id, {search:String}) > 0)
           or (positionCaseInsensitive(city, {search:String}) > 0)
           or (positionCaseInsensitive(browser, {search:String}) > 0)
           or (positionCaseInsensitive(os, {search:String}) > 0)
           or (positionCaseInsensitive(device, {search:String}) > 0))`
    : '';

  return pagedRawQuery(
    `
    select
      session_replay.session_id as id,
      session_replay.website_id as websiteId,
      website_event.browser,
      website_event.os,
      website_event.device,
      website_event.country,
      website_event.city,
      sum(session_replay.event_count) as eventCount,
      count(session_replay.replay_id) as chunkCount,
      min(session_replay.started_at) as startedAt,
      max(session_replay.ended_at) as endedAt,
      toInt64(sum(dateDiff('millisecond', session_replay.started_at, session_replay.ended_at))) as duration,
      max(session_replay.created_at) as createdAt
    from session_replay
    join (
      select *
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ) website_event
    on website_event.session_id = session_replay.session_id
      and website_event.website_id = session_replay.website_id
    ${cohortQuery}
    where session_replay.website_id = {websiteId:UUID}
        and session_replay.created_at between {startDate:DateTime64} and {endDate:DateTime64}
    ${filterQuery}
    ${searchQuery}
    group by session_replay.session_id, session_replay.website_id, website_event.browser, website_event.os, website_event.device, website_event.country, website_event.city
    order by max(created_at) desc
    `,
    queryParams,
    filters,
    FUNCTION_NAME,
  );
}
