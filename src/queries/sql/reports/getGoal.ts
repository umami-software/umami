import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

export interface GoalParameters {
  startDate: Date;
  endDate: Date;
  type: string;
  value: string;
}

export async function getGoal(
  ...args: [websiteId: string, params: GoalParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
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

  let operator = '=';
  let paramValue = value;
  if (value.startsWith('*') || value.endsWith('*')) {
    operator = 'like';
    paramValue = value.replace(/^\*|\*$/g, '%');
  }

  const { filterQuery, dateQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value: paramValue,
    startDate,
    endDate,
    eventType,
  });

  const excludeEventTypeFilterQuery = filterQuery
    .split('\n')
    .filter(filter => !filter.includes('event_type'))
    .join('\n')
    .trim();

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
      ${excludeEventTypeFilterQuery}
    ) as total
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and ${column} ${operator} {{value}}
      ${dateQuery}
      ${filterQuery}
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

  let operator = '=';
  let paramValue = value;
  if (value.startsWith('*') || value.endsWith('*')) {
    operator = 'like';
    paramValue = value.replace(/^\*|\*$/g, '%');
  }

  const { filterQuery, dateQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value: paramValue,
    startDate,
    endDate,
    eventType,
  });

  const excludeEventTypeFilterQuery = filterQuery
    .split('\n')
    .filter(filter => !filter.includes('event_type'))
    .join('\n')
    .trim();

  return rawQuery(
    `
    select count(distinct session_id) as num,
    (
      select count(distinct session_id)
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        ${dateQuery}
        ${excludeEventTypeFilterQuery}
    ) as total
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and ${column} ${operator} {value:String}
      ${dateQuery}
      ${filterQuery}
    `,
    queryParams,
  ).then(results => results?.[0]);
}

async function oceanbaseQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
) {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = oceanbase;
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';

  let operator = '=';
  let paramValue = value;
  if (value.startsWith('*') || value.endsWith('*')) {
    operator = 'LIKE';
    paramValue = value.replace(/^\*|\*$/g, '%');
  }

  const { filterQuery, dateQuery, joinSessionQuery, cohortQuery, buildParams, getDateParams, queryParams } = parseFilters({
    ...filters,
    websiteId,
    value: paramValue,
    startDate,
    endDate,
    eventType,
  });

  const excludeEventTypeFilterQuery = filterQuery
    .split('\n')
    .filter(filter => !filter.includes('event_type'))
    .join('\n')
    .trim();

  const dateParams = getDateParams();

  // Build params for subquery: cohortQuery + websiteId + dateQuery + excludeFilter
  const subqueryParams = buildParams([websiteId, ...dateParams]);

  // Build params for main query: cohortQuery + websiteId + paramValue + dateQuery + filterQuery
  const mainQueryParams = buildParams([websiteId, paramValue, ...dateParams]);

  return rawQuery(
    `
    SELECT COUNT(DISTINCT website_event.session_id) AS num,
    (
      SELECT COUNT(DISTINCT website_event.session_id)
      FROM website_event
      ${cohortQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = ?
      ${dateQuery}
      ${excludeEventTypeFilterQuery}
    ) AS total
    FROM website_event
    ${cohortQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = ?
      AND ${column} ${operator} ?
      ${dateQuery}
      ${filterQuery}
    `,
    [...subqueryParams, ...mainQueryParams],
  ).then((results: any) => results?.[0]);
}
