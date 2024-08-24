import prisma from 'lib/prisma';
import clickhouse from 'lib/clickhouse';
import { runQuery, PRISMA, CLICKHOUSE } from 'lib/db';
import { QueryFilters } from 'lib/types';

export async function getWebsiteSessionsWeekly(
  ...args: [websiteId: string, filters?: QueryFilters]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc' } = filters;
  const { rawQuery, getDateWeeklySQL, parseFilters } = prisma;
  const { params } = await parseFilters(websiteId, filters);

  return rawQuery(
    `
    select
      ${getDateWeeklySQL('created_at', timezone)} as time,
      count(distinct session_id) as value
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
    group by time
    order by 2
    `,
    params,
  ).then(formatResults);
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { timezone = 'utc' } = filters;
  const { rawQuery } = clickhouse;
  const { startDate, endDate } = filters;

  return rawQuery(
    `
    select
      formatDateTime(toDateTime(created_at, '${timezone}'), '%w:%H') as time,
      count(distinct session_id) as value
    from website_event_stats_hourly
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by time
    order by time
    `,
    { websiteId, startDate, endDate },
  ).then(formatResults);
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
