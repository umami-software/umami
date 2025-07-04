import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

export interface GoalParameters {
  startDate: Date;
  endDate: Date;
  type: string;
  value: string;
  operator?: string;
  property?: string;
}

export async function getGoal(
  ...args: [websiteId: string, params: GoalParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, dateQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value,
    startDate,
    endDate,
  });
  const isPage = type === 'page';
  const column = isPage ? 'url_path' : 'event_name';
  const eventType = isPage ? 1 : 2;

  return rawQuery(
    `
    select count(*) as num,
    (
      select count(distinct session_id)
      from website_event
      where website_id = {websiteId:UUID}
      and event_type = ${eventType}
      ${dateQuery}
    ) as total
    from website_event
    where website_id = {websiteId:UUID}
    and event_type = ${eventType}
    and ${column} = {value:String}
    ${dateQuery}
    ${filterQuery}
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, dateQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value,
    startDate,
    endDate,
  });
  const isPage = type === 'page';
  const column = isPage ? 'url_path' : 'event_name';
  const eventType = isPage ? 1 : 2;

  return rawQuery(
    `
    select count(*) as num,
    (
      select count(distinct session_id)
      from website_event
      where website_id = {websiteId:UUID}
      ${dateQuery}
    ) as total
    from website_event
    where website_id = {websiteId:UUID}
    and event_type = ${eventType}
    and ${column} = {value:String}
    ${dateQuery}
    ${filterQuery}
    `,
    queryParams,
  ).then(results => results?.[0]);
}
