import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS, FILTER_COLUMNS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getPageviewMetrics';

export interface PageviewMetricsParameters {
  type: string;
  limit?: number | string;
  offset?: number | string;
}

export interface PageviewMetricsData {
  x: string;
  y: number;
}

export async function getPageviewMetrics(
  ...args: [websiteId: string, parameters: PageviewMetricsParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: PageviewMetricsParameters,
  filters: QueryFilters,
): Promise<PageviewMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters(
      {
        ...filters,
        websiteId,
      },
      { joinSession: SESSION_COLUMNS.includes(type) },
    );

  let entryExitQuery = '';
  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = `and website_event.referrer_domain != regexp_replace(website_event.hostname, '^www.', '')
      and website_event.referrer_domain != ''`;
  }

  if (type === 'entry' || type === 'exit') {
    const order = type === 'entry' ? 'asc' : 'desc';
    column = `x.${column}`;

    entryExitQuery = `
      join (
        select distinct on (visit_id)
          visit_id,
          url_path
        from website_event
        where website_event.website_id = {{websiteId::uuid}}
          and website_event.created_at between {{startDate}} and {{endDate}}
          and website_event.event_type NOT IN (2, 5)
        order by visit_id, created_at ${order}
      ) x
      on x.visit_id = website_event.visit_id
    `;
  }

  return rawQuery(
    `
    select ${column} x,
      count(distinct website_event.session_id) as y
    from website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    ${joinSessionQuery}
    ${entryExitQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type NOT IN (2, 5)
      and ${column} != ''
      ${excludeDomain}
      ${filterQuery}
    group by 1
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
  parameters: PageviewMetricsParameters,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  let sql = '';
  let excludeDomain = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    let entryExitQuery = '';

    if (column === 'referrer_domain') {
      excludeDomain = `and referrer_domain != hostname and referrer_domain != ''`;
    }

    if (type === 'entry' || type === 'exit') {
      const aggregrate = type === 'entry' ? 'argMin' : 'argMax';
      column = `x.${column}`;

      entryExitQuery = `
      JOIN (select visit_id,
          ${aggregrate}(url_path, created_at) url_path
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
      group by visit_id) x
      ON x.visit_id = website_event.visit_id`;
    }

    sql = `
    select ${column} x, 
      uniq(website_event.session_id) as y
    from website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    ${entryExitQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type NOT IN (2, 5)
      and ${column} != ''
      ${excludeDomain}
      ${filterQuery}
    group by x
    order by y desc
    limit ${limit}
    offset ${offset}
    `;
  } else {
    let groupByQuery = '';
    let columnQuery = `arrayJoin(${column})`;

    if (column === 'referrer_domain') {
      excludeDomain = `and t != ''`;
    }

    if (type === 'entry') {
      columnQuery = `argMinMerge(entry_url)`;
    }

    if (type === 'exit') {
      columnQuery = `argMaxMerge(exit_url)`;
    }

    if (type === 'entry' || type === 'exit') {
      groupByQuery = 'group by s';
    }

    sql = `
    select g.t as x,
      uniq(s) as y
    from (
      select session_id s, 
        ${columnQuery} as t
      from website_event_stats_hourly as website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
        ${excludeDomain}
        ${filterQuery}
      ${groupByQuery}) as g
    group by x
    order by y desc
    limit ${limit}
    offset ${offset}
    `;
  }

  return rawQuery(sql, { ...queryParams, ...parameters }, FUNCTION_NAME);
}

async function oceanbaseQuery(
  websiteId: string,
  parameters: PageviewMetricsParameters,
  filters: QueryFilters,
): Promise<PageviewMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, buildParams } =
    parseFilters(
      {
        ...filters,
        websiteId,
      },
      { joinSession: SESSION_COLUMNS.includes(type) },
    );

  let entryExitParams: any[] = [];
  let entryExitQuery = '';
  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = `AND website_event.referrer_domain != REGEXP_REPLACE(website_event.hostname, '^www.', '')
      AND website_event.referrer_domain != ''`;
  }

  if (type === 'entry' || type === 'exit') {
    const order = type === 'entry' ? 'ASC' : 'DESC';
    column = `x.${column}`;
    entryExitParams = [websiteId, filters.startDate, filters.endDate];

    entryExitQuery = `
      JOIN (
        SELECT visit_id, url_path
        FROM (
          SELECT visit_id, url_path,
            ROW_NUMBER() OVER (PARTITION BY visit_id ORDER BY created_at ${order}) AS rn
          FROM website_event
          WHERE website_event.website_id = ?
            AND website_event.created_at BETWEEN ? AND ?
            AND website_event.event_type NOT IN (2, 5)
        ) ranked
        WHERE rn = 1
      ) x
      ON x.visit_id = website_event.visit_id
    `;
  }

  const params = buildParams([...entryExitParams, websiteId, filters.startDate, filters.endDate]);

  return rawQuery(
    `
    SELECT ${column} x,
      COUNT(DISTINCT website_event.session_id) AS y
    FROM website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    ${joinSessionQuery}
    ${entryExitQuery}
    WHERE website_event.website_id = ?
      AND website_event.created_at BETWEEN ? AND ?
      AND website_event.event_type NOT IN (2, 5)
      AND ${column} != ''
      ${excludeDomain}
      ${filterQuery}
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT ${limit}
    OFFSET ${offset}
    `,
    params,
    FUNCTION_NAME,
  );
}
