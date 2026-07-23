import clickhouse from '@/lib/clickhouse';
import { BOUNCE_THRESHOLD, EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventExpandedMetrics';

export interface EventExpandedMetricParameters {
  type: string;
  limit?: string;
  offset?: string;
}

export interface EventExpandedMetricData {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getEventExpandedMetrics(
  ...args: [websiteId: string, parameters: EventExpandedMetricParameters, filters: QueryFilters]
): Promise<EventExpandedMetricData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: EventExpandedMetricParameters,
  filters: QueryFilters,
) {
  const { type, limit = 500, offset = 0 } = parameters;
  const column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters, getTimestampDiffSQL } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
      eventType: EVENT_TYPE.customEvent,
    },
    { joinSession: SESSION_COLUMNS.includes(type) },
  );

  return rawQuery(
    `
    select
      name,
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(case when t.c = 1 and (t.events_count - t.c) < ${BOUNCE_THRESHOLD} then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime"
    from (
      select
        ${column} as "name",
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
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
      group by name, website_event.session_id, website_event.visit_id
    ) as t
    where name != ''
    group by name 
    order by visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: EventExpandedMetricParameters,
  filters: QueryFilters,
): Promise<EventExpandedMetricData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  const column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.customEvent,
  });

  return rawQuery(
    `
    select
      name,
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      sumIf(1, t.c = 1 and (toInt64(ifNull(e.events_count, 0)) - toInt64(t.c)) < ${BOUNCE_THRESHOLD}) as "bounces",
      sum(max_time-min_time) as "totaltime"
    from (
      select
        ${column} name,
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and name != ''
        ${filterQuery}
      group by name, session_id, visit_id
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
    order by visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}
