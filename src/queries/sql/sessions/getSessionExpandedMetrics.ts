import clickhouse from '@/lib/clickhouse';
import { BOUNCE_THRESHOLD, EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
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
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `lower(left(${type}, 2))`;
  }

  return rawQuery(
    `
    select
      name,
      ${includeCountry ? 'country,' : ''}
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(case when t.c = 1 and t.events_count < ${BOUNCE_THRESHOLD} then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime"
    from (
      select
        ${column} as "name",
        ${includeCountry ? 'country,' : ''}
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time",
        max((
          select count(*)
          from website_event we2
          where we2.website_id = website_event.website_id
            and we2.session_id = website_event.session_id
            and we2.visit_id = website_event.visit_id
            and we2.created_at between {{startDate}} and {{endDate}}
            and we2.event_type = ${EVENT_TYPE.customEvent}
        )) as "events_count"
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type NOT IN (2, 5)
        ${filterQuery}
      group by name, website_event.session_id, website_event.visit_id
      ${includeCountry ? ', country' : ''}
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
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `lower(left(${type}, 2))`;
  }

  return rawQuery(
    `
    select
      name,
      ${includeCountry ? 'country,' : ''}
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      sumIf(1, t.c = 1 and ifNull(e.events_count, 0) < ${BOUNCE_THRESHOLD}) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        ${column} name,
        ${includeCountry ? 'country,' : ''}
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
        and name != ''
        ${filterQuery}
      group by name, session_id, visit_id
      ${includeCountry ? ', country' : ''}
    ) as t
    left join (
      select session_id, visit_id, toUInt32(count()) as events_count
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = ${EVENT_TYPE.customEvent}
      group by session_id, visit_id
    ) as e using (session_id, visit_id)
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
