import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

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
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';

  // Filters WITHOUT eventType for total count (all sessions)
  const {
    filterQuery: baseFilterQuery,
    dateQuery,
    joinSessionQuery,
    cohortQuery,
    queryParams: baseQueryParams,
  } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });

  // Filters WITH eventType for goal-specific count
  const { filterQuery: goalFilterQuery, queryParams: goalQueryParams } = parseFilters({
    ...filters,
    websiteId,
    value,
    startDate,
    endDate,
    eventType,
  });

  const queryParams = { ...baseQueryParams, ...goalQueryParams };

  return rawQuery(
    `
    select count(distinct website_event.session_id) as num,
    (
      select count(distinct website_event.session_id)
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
      ${dateQuery}
      ${baseFilterQuery}
    ) as total
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and ${column} = {{value}}
      ${dateQuery}
      ${goalFilterQuery}
    `,
    queryParams,
  ).then(results => results?.[0]);
}

async function clickhouseQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';

  // Filters WITHOUT eventType for total count (all sessions)
  const {
    filterQuery: baseFilterQuery,
    dateQuery,
    cohortQuery,
    queryParams: baseQueryParams,
  } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });

  // Filters WITH eventType for goal-specific count
  const { filterQuery: goalFilterQuery, queryParams: goalQueryParams } = parseFilters({
    ...filters,
    websiteId,
    value,
    startDate,
    endDate,
    eventType,
  });

  const queryParams = { ...baseQueryParams, ...goalQueryParams };

  return rawQuery(
    `
    select count(distinct session_id) as num,
    (
      select count(distinct session_id)
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        ${dateQuery}
        ${baseFilterQuery}
    ) as total
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and ${column} = {value:String}
      ${dateQuery}
      ${goalFilterQuery}
    `,
    queryParams,
  ).then(results => results?.[0]);
}
