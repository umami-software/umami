import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS, FILTER_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getSessionMetrics';

export interface SessionMetricsParameters {
  type: string;
  limit?: number | string;
  offset?: number | string;
}

export async function getSessionMetrics(
  ...args: [websiteId: string, parameters: SessionMetricsParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: SessionMetricsParameters,
  filters: QueryFilters,
) {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { parseFilters, rawQuery } = prisma;
  // Session-level filters in `filters` still force the session join inside the
  // subquery below (parseFilters detects them), but the grouped column itself
  // no longer needs it: the outer query reads it from `session` directly.
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters({
      ...filters,
      websiteId,
    });
  const includeCountry = column === 'city' || column === 'region';

  if (type === 'language') {
    column = `lower(left(session.${type}, 2))`;
  } else {
    column = `session.${column}`;
  }

  // Aggregate first, join once: reduce the event rows in the date range down
  // to the distinct set of session ids (an index-only scan), then join each
  // session row a single time to read the grouped attribute. This avoids
  // joining `session` against every event row and the count(distinct) over
  // the full join, which dominated the runtime of this query.
  return rawQuery(
    `
    select
      ${column} x,
      count(*) y
      ${includeCountry ? ', session.country' : ''}
    from (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type NOT IN (2, 5)
      ${filterQuery}
    ) t
    join session on session.session_id = t.session_id
    where session.website_id = {{websiteId::uuid}}
      and ${column} != ''
    group by 1
    ${includeCountry ? ', 3' : ''}
    order by 2 desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: SessionMetricsParameters,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
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

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      ${column} x,
      count(distinct session_id) y
      ${includeCountry ? ', country' : ''}
    from website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type NOT IN (2, 5)
      and ${column} != ''
      ${filterQuery}
    group by x
    ${includeCountry ? ', country' : ''}
    order by y desc
    limit ${limit}
    offset ${offset}
    `;
  } else {
    sql = `
    select
      ${column} x,
      uniq(session_id) y
      ${includeCountry ? ', country' : ''}
    from website_event_stats_hourly as website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type NOT IN (2, 5)
      and ${column} != ''
      ${filterQuery}
    group by x 
    ${includeCountry ? ', country' : ''}
    order by y desc
    limit ${limit}
    offset ${offset}
    `;
  }

  return rawQuery(sql, { ...queryParams, ...parameters }, FUNCTION_NAME);
}
