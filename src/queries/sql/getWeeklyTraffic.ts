import clickhouse from '@/lib/clickhouse';
import { EVENT_COLUMNS } from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWeeklyTraffic';

export async function getWeeklyTraffic(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc' } = filters;
  const { rawQuery, getDateWeeklySQL, parseFilters } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, queryParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  return rawQuery(
    `
    select
      ${getDateWeeklySQL('website_event.created_at', timezone)} as time,
      count(distinct website_event.session_id) as value
    from website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type NOT IN (2, 5)
      ${filterQuery}
    group by time
    order by 1
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(formatResults as ( unknown) => any[]);
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc' } = filters;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, excludeBounceQuery, queryParams } = await parseFilters({
    ...filters,
    websiteId,
  });

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      formatDateTime(toDateTime(created_at, '${timezone}'), '%w:%H') as time,
      count(distinct session_id) as value
    from website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type NOT IN (2, 5)
      ${filterQuery}
    group by time
    order by time
    `;
  } else {
    sql = `
    select
      formatDateTime(toDateTime(created_at, '${timezone}'), '%w:%H') as time,
      count(distinct session_id) as value
    from website_event_stats_hourly website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type NOT IN (2, 5)
      ${filterQuery}
    group by time
    order by time
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME).then(formatResults as ( unknown) => any[]);
}

function formatResults(data: { time: string; value: number }[]) {
  const days = [];

  for (let i = 0; i < 7; i++) {
    days.push([]);

    for (let j = 0; j < 24; j++) {
      days[i].push(
        Number(
          data.find(({ time }) => time === `${i}:${j.toString().padStart(2, '0')}`)?.value || 0,
        ),
      );
    }
  }

  return days;
}

async function oceanbaseQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc' } = filters;
  const { rawQuery, getDateWeeklySQL, parseFilters } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, buildParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  const params = buildParams([websiteId, filters.startDate, filters.endDate]);

  return rawQuery(
    `
    SELECT
      ${getDateWeeklySQL('website_event.created_at', timezone)} AS time,
      COUNT(DISTINCT website_event.session_id) AS value
    FROM website_event
    ${cohortQuery}
    ${excludeBounceQuery}
    ${joinSessionQuery}
    WHERE website_event.website_id = ?
      AND website_event.created_at BETWEEN ? AND ?
      AND website_event.event_type NOT IN (2, 5)
      ${filterQuery}
    GROUP BY time
    ORDER BY 1
    `,
    params,
    FUNCTION_NAME,
  ).then(formatResults as ( unknown) => any[]);
}
