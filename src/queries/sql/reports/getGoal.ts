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

  const { filterQuery, dateQuery, joinSessionQuery, cohortQuery, queryParams, getDateParams } = parseFilters({
    ...filters,
    websiteId,
    value: paramValue,
    startDate,
    endDate,
    eventType,
  });

  // Parse filters again without eventType to get clean SQL and params for the subquery
  const { filterQuery: subFilterQuery, queryParams: subQueryParams } = parseFilters({
    ...filters,
    websiteId,
    value: paramValue,
    startDate,
    endDate,
  });

  const dateParams = getDateParams();

  // Subquery: cohort(0|3) + websiteId + dateQuery + subFilterQuery (no event_type)
  const subqueryParams = [
    ...(cohortQuery ? [websiteId, startDate, endDate] : []),
    websiteId,
    ...dateParams,
    ...subQueryParams,
  ];

  // Main query: cohort(0|3) + websiteId + paramValue + dateQuery + filterQuery
  const mainQueryParams = [
    ...(cohortQuery ? [websiteId, startDate, endDate] : []),
    websiteId,
    paramValue,
    ...dateParams,
    ...queryParams,
  ];

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
      ${subFilterQuery}
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
