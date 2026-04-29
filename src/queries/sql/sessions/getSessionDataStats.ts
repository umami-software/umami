import clickhouse from '@/lib/clickhouse';
import { DATA_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PropertyFilter, PropertyLeaderboardRow, QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionDataStats';

export async function getSessionDataStats(
  ...args: [websiteId: string, propertyName: string, filters: QueryFilters, propertyFilters?: PropertyFilter[]]
): Promise<PropertyLeaderboardRow[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  propertyName: string,
  filters: QueryFilters,
  propertyFilters: PropertyFilter[] = [],
) {
  const { timezone = 'utc' } = filters;
  const { rawQuery, parseFilters, getPropertyFilterQuery, getTimestampDiffSQL } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    timezone,
  });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(propertyFilters, 'session', timezone);
 
  return rawQuery(
    `
    with filtered_sessions as (
      select distinct website_event.session_id, website_event.website_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
        ${pfSQL}
    ),
    session_rollup as (
      select
        website_event.session_id,
        website_event.visit_id,
        count(*) as activity,
        sum(case when website_event.event_type = 1 then 1 else 0 end) as views,
        sum(case when website_event.event_type = 2 then 1 else 0 end) as events,
        min(website_event.created_at) as min_time,
        max(website_event.created_at) as max_time
      from website_event
      join filtered_sessions
        on filtered_sessions.session_id = website_event.session_id
        and filtered_sessions.website_id = website_event.website_id
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
      group by website_event.session_id, website_event.visit_id
    ),
    session_stats as (
      select
        session_id,
        count(*) as visits,
        sum(activity) as activity,
        sum(views) as views,
        sum(events) as events,
        sum(${getTimestampDiffSQL('min_time', 'max_time')}) as totaltime
      from session_rollup
      group by session_id
    ),
    property_values as (
      select
        session_data.session_id,
        session_data.string_value as value
      from session_data
      join filtered_sessions
        on filtered_sessions.session_id = session_data.session_id
        and filtered_sessions.website_id = session_data.website_id
      where session_data.website_id = {{websiteId::uuid}}
        and session_data.data_key = {{propertyName}}
        and session_data.data_type = ${DATA_TYPE.string}
        and coalesce(session_data.string_value, '') != ''
    )
    select
      property_values.value as label,
      coalesce(sum(session_stats.activity), 0) as activity,
      count(distinct property_values.session_id) as sessions,
      coalesce(sum(session_stats.visits), 0) as visits,
      coalesce(sum(session_stats.views), 0) as views,
      coalesce(sum(session_stats.events), 0) as events,
      coalesce(sum(session_stats.totaltime), 0) as totaltime,
      coalesce(sum(case when session_stats.visits = 1 then 1 else 0 end), 0) as "newSessions",
      coalesce(sum(case when session_stats.visits > 1 then 1 else 0 end), 0) as "returningSessions"
    from property_values
    join session_stats on session_stats.session_id = property_values.session_id
    group by property_values.value
    order by activity desc, property_values.value asc
    limit 100
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  propertyName: string,
  filters: QueryFilters,
  propertyFilters: PropertyFilter[] = [],
) {
  const { timezone = 'UTC' } = filters;
  const { rawQuery, parseFilters, getPropertyFilterQuery } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({ ...filters, websiteId, timezone });
  const { sql: pfSQL, params: pfParams } = getPropertyFilterQuery(propertyFilters, 'session', timezone);

  return rawQuery(
    `
    with filtered_sessions as (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      where website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
      ${pfSQL}
    ),
    session_rollup as (
      select
        website_event.session_id,
        website_event.visit_id,
        count() as activity,
        sumIf(1, website_event.event_type = 1) as views,
        sumIf(1, website_event.event_type = 2) as events,
        min(website_event.created_at) as min_time,
        max(website_event.created_at) as max_time
      from website_event
      join filtered_sessions on filtered_sessions.session_id = website_event.session_id
      where website_event.website_id = {websiteId:UUID}
        and website_event.created_at between {startDate:DateTime64} and {endDate:DateTime64}
      group by website_event.session_id, website_event.visit_id
    ),
    session_stats as (
      select
        session_id,
        count() as visits,
        sum(activity) as activity,
        sum(views) as views,
        sum(events) as events,
        sum(max_time - min_time) as totaltime
      from session_rollup
      group by session_id
    ),
    property_values as (
      select
        session_data.session_id,
        session_data.string_value as value
      from session_data final
      join filtered_sessions on filtered_sessions.session_id = session_data.session_id
      where session_data.website_id = {websiteId:UUID}
        and session_data.data_key = {propertyName:String}
        and session_data.data_type = ${DATA_TYPE.string}
        and ifNull(session_data.string_value, '') != ''
    )
    select
      property_values.value as label,
      ifNull(sum(session_stats.activity), 0) as activity,
      uniq(property_values.session_id) as sessions,
      ifNull(sum(session_stats.visits), 0) as visits,
      ifNull(sum(session_stats.views), 0) as views,
      ifNull(sum(session_stats.events), 0) as events,
      ifNull(sum(session_stats.totaltime), 0) as totaltime,
      ifNull(sum(if(session_stats.visits = 1, 1, 0)), 0) as newSessions,
      ifNull(sum(if(session_stats.visits > 1, 1, 0)), 0) as returningSessions
    from property_values
    join session_stats on session_stats.session_id = property_values.session_id
    group by property_values.value
    order by activity desc, property_values.value asc
    limit 100
    `,
    { ...queryParams, websiteId, propertyName, ...pfParams },
    FUNCTION_NAME,
  );
}
