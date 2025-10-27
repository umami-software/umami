import clickhouse from '@/lib/clickhouse';
import { FILTER_COLUMNS, GROUPED_DOMAINS, SESSION_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getPageviewExpandedMetrics';

export interface PageviewExpandedMetricsParameters {
  type: string;
  limit?: number | string;
  offset?: number | string;
}

export interface PageviewExpandedMetricsData {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getPageviewExpandedMetrics(
  ...args: [websiteId: string, parameters: PageviewExpandedMetricsParameters, filters: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: PageviewExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<PageviewExpandedMetricsData[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters, getTimestampDiffSQL } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters(
    {
      ...filters,
      websiteId,
    },
    { joinSession: SESSION_COLUMNS.includes(type) },
  );

  let entryExitQuery = '';
  let excludeDomain = '';

  if (column === 'referrer_domain') {
    excludeDomain = `and website_event.referrer_domain != website_event.hostname
      and website_event.referrer_domain != ''`;
    if (type === 'domain') {
      column = toPostgresGroupedReferrer(GROUPED_DOMAINS);
    }
  }

  if (type === 'entry' || type === 'exit') {
    const aggregrate = type === 'entry' ? 'min' : 'max';

    entryExitQuery = `
      join (
        select visit_id,
            ${aggregrate}(created_at) target_created_at
        from website_event
        where website_event.website_id = {{websiteId::uuid}}
          and website_event.created_at between {{startDate}} and {{endDate}}
          and website_event.event_type != 2
        group by visit_id
      ) x
      on x.visit_id = website_event.visit_id
          and x.target_created_at = website_event.created_at
    `;
  }

  return rawQuery(
    `
    select
      name,
      sum(t.c) as "pageviews",
      count(distinct t.session_id) as "visitors",
      count(distinct t.visit_id) as "visits",
      sum(case when t.c = 1 then 1 else 0 end) as "bounces",
      sum(${getTimestampDiffSQL('t.min_time', 't.max_time')}) as "totaltime"
    from (
      select
        ${column} name,
        website_event.session_id,
        website_event.visit_id,
        count(*) as "c",
        min(website_event.created_at) as "min_time",
        max(website_event.created_at) as "max_time"
      from website_event
      ${cohortQuery}
      ${joinSessionQuery} 
      ${entryExitQuery} 
      where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type != 2
        ${excludeDomain}
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
  parameters: PageviewExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { type, limit = 500, offset = 0 } = parameters;
  let column = FILTER_COLUMNS[type] || type;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  let excludeDomain = '';
  let entryExitQuery = '';

  if (column === 'referrer_domain') {
    excludeDomain = `and referrer_domain != hostname and referrer_domain != ''`;
    if (type === 'domain') {
      column = toClickHouseGroupedReferrer(GROUPED_DOMAINS);
    }
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
        and event_type != 2
      group by visit_id) x
      ON x.visit_id = website_event.visit_id`;
  }

  return rawQuery(
    `
    select
      name,
      sum(t.c) as "pageviews",
      uniq(t.session_id) as "visitors",
      uniq(t.visit_id) as "visits",
      sum(if(t.c = 1, 1, 0)) as "bounces",
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
      ${entryExitQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type != 2
        and name != ''
        ${excludeDomain}
        ${filterQuery}
      group by name, session_id, visit_id
    ) as t
    group by name 
    order by visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
    FUNCTION_NAME,
  );
}

export function toClickHouseGroupedReferrer(
  domains: any[],
  column: string = 'referrer_domain',
): string {
  return [
    'CASE',
    ...domains.map(group => {
      const matches = Array.isArray(group.match) ? group.match : [group.match];
      const formattedArray = matches.map(m => `'${m}'`).join(', ');
      return `  WHEN multiSearchAny(${column}, [${formattedArray}]) != 0 THEN '${group.domain}'`;
    }),
    "  ELSE 'Other'",
    'END',
  ].join('\n');
}

export function toPostgresGroupedReferrer(
  domains: any[],
  column: string = 'referrer_domain',
): string {
  return [
    'CASE',
    ...domains.map(group => {
      const matches = Array.isArray(group.match) ? group.match : [group.match];

      return `WHEN ${toPostgresLikeClause(column, matches)} THEN '${group.domain}'`;
    }),
    "  ELSE 'Other'",
    'END',
  ].join('\n');
}

function toPostgresLikeClause(column: string, arr: string[]) {
  return arr.map(val => `${column} ilike '%${val.replace(/'/g, "''")}%'`).join(' OR\n  ');
}
