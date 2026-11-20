import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface BreakdownParameters {
  startDate: Date;
  endDate: Date;
  fields: string[];
}

export interface BreakdownData {
  views: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
  [field: string]: string | number;
}

export async function getBreakdown(
  ...args: [websiteId: string, parameters: BreakdownParameters, filters: QueryFilters]
): Promise<BreakdownData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: BreakdownParameters,
  filters: QueryFilters,
): Promise<BreakdownData[]> {
  const { getTimestampDiffSQL, parseFilters, rawQuery } = prisma;
  const { startDate, endDate, fields } = parameters;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters(
      {
        ...filters,
        websiteId,
        startDate,
        endDate,
      },
      {
        joinSession: !!fields.find((name: string) => SESSION_COLUMNS.includes(name)),
      },
    );
  const bounceQuery =
    filters.excludeBounce !== true
      ? `sum(case when t.c = 1 and t.has_custom_event = 0 then 1 else 0 end) as "bounces",`
      : '0 as "bounces",';

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      ${bounceQuery}
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
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
      group by ${parseFieldsByName(fields)},
        website_event.session_id, website_event.visit_id
      having sum(case when website_event.event_type NOT IN (2, 5) then 1 else 0 end) > 0
    ) as t
    group by ${parseFieldsByName(fields)}
    order by 2 desc, 1 desc
    limit 500
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: BreakdownParameters,
  filters: QueryFilters,
): Promise<BreakdownData[]> {
  const { parseFilters, rawQuery } = clickhouse;
  const { startDate, endDate, fields } = parameters;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });
  const bounceQuery =
    filters.excludeBounce !== true
      ? `sumIf(1, t.c = 1 and t.has_custom_event = 0) as "bounces",`
      : '0 as "bounces",';

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      ${bounceQuery}
      sum(max_time-min_time) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
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
        ${filterQuery}
      group by ${parseFieldsByName(fields)},
        session_id, visit_id
      having c > 0
    ) as t
    group by ${parseFieldsByName(fields)}
    order by 2 desc, 1 desc
    limit 500
    `,
    queryParams,
  );
}

function parseFields(fields: string[]) {
  return fields.map(name => `${FILTER_COLUMNS[name]} as "${name}"`).join(',');
}

function parseFieldsByName(fields: string[]) {
  return `${fields.map(name => `"${name}"`).join(',')}`;
}
