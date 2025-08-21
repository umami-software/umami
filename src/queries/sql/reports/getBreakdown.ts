import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { QueryFilters } from '@/lib/types';

export interface BreakdownParameters {
  startDate: Date;
  endDate: Date;
  fields: string[];
}

export interface BreakdownData {
  x: string;
  y: number;
}

export async function getBreakdown(
  ...args: [websiteId: string, parameters: BreakdownParameters, filters: QueryFilters]
) {
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
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
      startDate,
      endDate,
      eventType: EVENT_TYPE.pageView,
    },
    {
      joinSession: !!fields.find((name: string) => SESSION_COLUMNS.includes(name)),
    },
  );

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(case when t.c = 1 then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
      ${cohortQuery}  
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        ${filterQuery}
      group by ${parseFieldsByName(fields)}, 
        website_event.session_id, website_event.visit_id
    ) as t
    group by ${parseFieldsByName(fields)}
    order by 1 desc, 2 desc
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
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    select
      sum(t.c) as "views",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(if(t.c = 1, 1, 0)) as "bounces",
      sum(max_time-min_time) as "totaltime",
      ${parseFieldsByName(fields)}
    from (
      select
        ${parseFields(fields)},
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        ${filterQuery}
      group by ${parseFieldsByName(fields)}, 
        session_id, visit_id
    ) as t
    group by ${parseFieldsByName(fields)}
    order by 1 desc, 2 desc
    limit 500
    `,
    queryParams,
  );
}

function parseFields(fields: string[]) {
  return fields.map(name => `${FILTER_COLUMNS[name]} as "${name}"`).join(',');
}

function parseFieldsByName(fields: string[]) {
  return `${fields.map(name => name).join(',')}`;
}
