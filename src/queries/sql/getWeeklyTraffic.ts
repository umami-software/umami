import prisma from '@/lib/prisma';
import clickhouse from '@/lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from '@/lib/db';
import { QueryFilters } from '@/lib/types';
import { EVENT_COLUMNS } from '@/lib/constants';

const FUNCTION_NAME = 'getWeeklyTraffic';

export async function getWeeklyTraffic(...args: [websiteId: string, filters: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const timezone = 'utc';
  const { rawQuery, getDateWeeklySQL, parseFilters } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
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
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      ${filterQuery}
    group by time
    order by 2
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(formatResults);
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc' } = filters;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = await parseFilters({ ...filters, websiteId });

  let sql = '';

  if (EVENT_COLUMNS.some(item => Object.keys(filters).includes(item))) {
    sql = `
    select
      formatDateTime(toDateTime(created_at, '${timezone}'), '%w:%H') as time,
      count(distinct session_id) as value
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
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
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ${filterQuery}
    group by time
    order by time
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME).then(formatResults);
}

function formatResults(data: any) {
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
