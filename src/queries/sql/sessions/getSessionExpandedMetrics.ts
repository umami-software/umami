import clickhouse from '@/lib/clickhouse';
import {
  EVENT_TYPE,
  FILTER_COLUMNS,
  SESSION_COLUMNS,
} from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionExpandedMetrics';

export interface SessionExpandedMetricsParameters {
  type: string;
  limit?: number | string;
  offset?: number | string;
}

export interface SessionExpandedMetricsData {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getSessionExpandedMetrics(
  ...args: [websiteId: string, parameters: SessionExpandedMetricsParameters, filters: QueryFilters]
): Promise<SessionExpandedMetricsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: SessionExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<SessionExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery, getTimestampDiffSQL } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters(
      {
        ...filters,
        websiteId,
      },
      {
        joinSession: SESSION_COLUMNS.includes(type),
      },
    );
  const needsBounceEvents = filters.excludeBounce !== true;
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `lower(left(${type}, 2))`;
  }
  const bounceQuery = needsBounceEvents
    ? `sum(case when t.c = 1 and t.has_custom_event = 0 then 1 else 0 end) as "bounces",`
    : '0 as "bounces",';

  return rawQuery(
    `
    select
      name,
      ${includeCountry ? 'country,' : ''}
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      ${bounceQuery}
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime"
    from (
      select
        ${column} as "name",
        ${includeCountry ? 'country,' : ''}
        website_event.session_id,
        website_event.visit_id,
        sum(case when website_event.event_type NOT IN (2, 5) then 1 else 0 end) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time",
        max(case when website_event.event_type = ${EVENT_TYPE.customEvent} then 1 else 0 end) as "has_custom_event"
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type != ${EVENT_TYPE.performance}
        ${filterQuery}
      group by name, website_event.session_id, website_event.visit_id
      ${includeCountry ? ', country' : ''}
      having sum(case when website_event.event_type NOT IN (2, 5) then 1 else 0 end) > 0
    ) as t
    where name != ''
    group by name 
    ${includeCountry ? ', country' : ''}
    order by visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: SessionExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<SessionExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery } = clickhouse;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });
  const needsBounceEvents = filters.excludeBounce !== true;
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `lower(left(${type}, 2))`;
  }
  const bounceQuery = needsBounceEvents
    ? `sumIf(1, t.c = 1 and t.has_custom_event = 0) as "bounces",`
    : '0 as "bounces",';

  return rawQuery(
    `
    select
      name,
      ${includeCountry ? 'country,' : ''}
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      ${bounceQuery}
      sum(max_time-min_time) as "totaltime"
    from (
      select
        ${column} name,
        ${includeCountry ? 'country,' : ''}
        session_id,
        visit_id,
        sumIf(1, event_type NOT IN (2, 5)) c,
        min(created_at) min_time,
        max(created_at) max_time,
        max(if(event_type = ${EVENT_TYPE.customEvent}, 1, 0)) has_custom_event
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type != ${EVENT_TYPE.performance}
        and name != ''
        ${filterQuery}
      group by name, session_id, visit_id
      ${includeCountry ? ', country' : ''}
      having c > 0
    ) as t
    group by name
    ${includeCountry ? ', country' : ''}
    order by visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}
