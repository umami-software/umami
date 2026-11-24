import clickhouse from '@/lib/clickhouse';
import { BREAKDOWN_FIELDS, EVENT_TYPE, FILTER_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { getWildcardMatch } from '@/lib/search';
import type { QueryFilters } from '@/lib/types';

export interface GoalParameters {
  startDate: Date;
  endDate: Date;
  type: string;
  value: string;
}

export interface GoalResult {
  num: number;
  total: number;
}

export interface GoalChartParameters extends GoalParameters {
  unit?: string;
  timezone?: string;
}

export interface GoalChartData {
  t: string;
  entered: number;
  converted: number;
}

export interface GoalSummaryData {
  completions: number;
  median: number | null;
}

export interface GoalBreakdownParameters extends GoalParameters {
  field: string;
}

export interface GoalBreakdownData {
  name: string;
  visitors: number;
  converted: number;
}

const GOAL_BREAKDOWN_LIMIT = 10;

export async function getGoal(
  ...args: [websiteId: string, params: GoalParameters, filters: QueryFilters]
): Promise<GoalResult> {
  const finalQuery = `
    select (select count(distinct session_id) from goal_events) as num,
      (select count(distinct session_id) from visits) as total`;

  return runQuery({
    [PRISMA]: () => relationalQuery(...args, finalQuery),
    [CLICKHOUSE]: () => clickhouseQuery(...args, finalQuery),
  }).then(results => results?.[0]);
}

// Sessions are bucketed by their first event; converted means they reached the goal.
export async function getGoalChart(
  ...args: [websiteId: string, parameters: GoalChartParameters, filters: QueryFilters]
): Promise<GoalChartData[]> {
  const [websiteId, parameters, filters] = args;
  const { unit = 'day', timezone = 'utc' } = parameters;

  const chartQuery = (dateQuery: string, countIf: (condition: string) => string) => `
    , starts AS (
      select session_id, min(created_at) as first_at
      from visits
      group by session_id
    )
    select ${dateQuery} as t,
      count(*) as entered,
      ${countIf('session_id in (select session_id from goal_events)')} as converted
    from starts
    group by t
    order by t`;

  return runQuery({
    [PRISMA]: () =>
      relationalQuery(
        websiteId,
        parameters,
        filters,
        chartQuery(
          prisma.getDateSQL('first_at', unit, timezone),
          condition => `sum(case when ${condition} then 1 else 0 end)`,
        ),
      ),
    [CLICKHOUSE]: () =>
      clickhouseQuery(
        websiteId,
        parameters,
        filters,
        chartQuery(
          clickhouse.getDateSQL('first_at', unit, timezone),
          condition => `countIf(${condition})`,
        ),
      ),
  }).then((rows: any[]) =>
    rows.map(({ t, entered, converted }) => ({
      t,
      entered: Number(entered) || 0,
      converted: Number(converted) || 0,
    })),
  );
}

// Goal hits, and the lower median of whole seconds from a session's first event to its first hit.
export async function getGoalSummary(
  ...args: [websiteId: string, parameters: GoalParameters, filters: QueryFilters]
): Promise<GoalSummaryData> {
  const summaryQuery = (median: string) => `
    , starts AS (
      select session_id, min(created_at) as first_at
      from visits
      group by session_id
    )
    , reached AS (
      select session_id, min(created_at) as first_at
      from goal_events
      group by session_id
    )
    select (select count(*) from goal_events) as completions,
      (select ${median}
        from reached b
        join starts a on a.session_id = b.session_id) as median,
      (select count(*) from reached) as sessions`;

  return runQuery({
    [PRISMA]: () =>
      relationalQuery(
        ...args,
        summaryQuery(
          'percentile_disc(0.5) within group (order by floor(extract(epoch from (b.first_at - a.first_at))))',
        ),
      ),
    [CLICKHOUSE]: () =>
      clickhouseQuery(
        ...args,
        summaryQuery("quantileExactLow(0.5)(dateDiff('second', a.first_at, b.first_at))"),
      ),
  }).then(([row]: any[]) => ({
    completions: Number(row?.completions) || 0,
    median: Number(row?.sessions) > 0 ? Number(row.median) : null,
  }));
}

// Visitors and converted visitors split by a session attribute, for its most common values.
export async function getGoalBreakdown(
  ...args: [websiteId: string, parameters: GoalBreakdownParameters, filters: QueryFilters]
): Promise<GoalBreakdownData[]> {
  const [websiteId, parameters, filters] = args;

  if (!(BREAKDOWN_FIELDS as readonly string[]).includes(parameters.field)) {
    throw new Error(`Unsupported goal breakdown field: ${parameters.field}`);
  }

  const column = FILTER_COLUMNS[parameters.field];

  const breakdownQuery = (dimsQuery: string, countIf: (condition: string) => string) => `
    , dims AS (${dimsQuery}
    )
    , top_dims AS (
      select name from dims group by name order by count(*) desc, name limit ${GOAL_BREAKDOWN_LIMIT}
    )
    select name,
      count(*) as visitors,
      ${countIf('session_id in (select session_id from goal_events)')} as converted
    from dims
    where name in (select name from top_dims)
    group by name`;

  return runQuery({
    [PRISMA]: () =>
      relationalQuery(
        websiteId,
        parameters,
        filters,
        breakdownQuery(
          `
      select starts.session_id, coalesce(session.${column}, '') as name
      from (select distinct session_id from visits) starts
      join session on session.session_id = starts.session_id
        and session.website_id = {{websiteId::uuid}}`,
          condition => `sum(case when ${condition} then 1 else 0 end)`,
        ),
      ),
    // Attributes can differ between a session's events, so take the first filtered event's value.
    [CLICKHOUSE]: () =>
      clickhouseQuery(
        websiteId,
        parameters,
        filters,
        breakdownQuery(
          `
      select session_id, argMin(${column}, created_at) as name
      from visits
      group by session_id`,
          condition => `countIf(${condition})`,
        ),
      ),
  }).then((rows: any[]) =>
    rows
      .map(({ name, visitors, converted }) => ({
        name,
        visitors: Number(visitors) || 0,
        converted: Number(converted) || 0,
      }))
      .sort((a, b) => b.visitors - a.visitors || a.name.localeCompare(b.name)),
  );
}

// Visits are every session in range; goal_events are the events that match the goal.
async function relationalQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
  finalQuery: string,
): Promise<any[]> {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = prisma;
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';

  const { operator, value: paramValue } = getWildcardMatch(value);

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
    WITH visits AS (
      select website_event.session_id, website_event.created_at
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
      ${dateQuery}
      ${excludeEventTypeFilterQuery}
    )
    , goal_events AS (
      select website_event.session_id, website_event.created_at
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and ${column} ${operator} {{value}}
        ${dateQuery}
        ${filterQuery}
    )
    ${finalQuery}
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: GoalParameters,
  filters: QueryFilters,
  finalQuery: string,
): Promise<any[]> {
  const { startDate, endDate, type, value } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const eventType = type === 'path' ? EVENT_TYPE.pageView : EVENT_TYPE.customEvent;
  const column = type === 'path' ? 'url_path' : 'event_name';

  const { operator, value: paramValue } = getWildcardMatch(value);

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
    WITH visits AS (
      select website_event.session_id as session_id, website_event.created_at as created_at,
        ${BREAKDOWN_FIELDS.map(field => `website_event.${FILTER_COLUMNS[field]} as ${FILTER_COLUMNS[field]}`).join(', ')}
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        ${dateQuery}
        ${excludeEventTypeFilterQuery}
    ),
    goal_events AS (
      select website_event.session_id as session_id, website_event.created_at as created_at
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and ${column} ${operator} {value:String}
        ${dateQuery}
        ${filterQuery}
    )
    ${finalQuery}
    `,
    queryParams,
  );
}
