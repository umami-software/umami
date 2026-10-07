import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { getRollupRange, getRollupWatermark } from '@/lib/rollups';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getEventStats';

export interface EventStatsParameters {
  limit?: number | string;
}

interface WebsiteEventMetric {
  x: string;
  t: string;
  y: number;
}

export async function getEventStats(
  ...args: [websiteId: string, parameters: EventStatsParameters, filters: QueryFilters]
): Promise<WebsiteEventMetric[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: EventStatsParameters,
  filters: QueryFilters,
) {
  const { limit } = parameters;
  const { timezone = 'utc', unit = 'day' } = filters;
  const { rawQuery, getDateTruncSQL, getDateFormatSQL, parseFilters } = prisma;
  const { filterQuery, cohortQuery, joinSessionQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  // Opt-in rollup path (ROLLUPS_ENABLED): sum hourly buckets from the
  // event-name tier and merge the raw tail past the watermark. Minute
  // granularity is finer than the rollup grain and always takes the raw path.
  if (!filterQuery && !cohortQuery && !joinSessionQuery && unit !== 'minute') {
    const watermark = await getRollupWatermark();
    const range = watermark && getRollupRange(filters.startDate, filters.endDate, watermark);

    if (range) {
      return rawQuery(
        `
        with g as (
          select nullif(event_name, '') as event_name, bucket as ts, events
          from website_event_rollup_hourly
          where website_id = {{websiteId::uuid}}
            and bucket >= {{hstart}}
            and bucket < {{hend}}
            and event_type = 2
          union all
          select event_name, date_trunc('hour', created_at), count(*)
          from website_event
          where website_id = {{websiteId::uuid}}
            and ((created_at >= {{startDate}} and created_at < {{hstart}})
              or (created_at >= {{hend}} and created_at <= {{endDate}}))
            and event_type = 2
          group by 1, 2
        )
        select t.x, ${getDateFormatSQL('t.t', unit, timezone)} t, t.y
        from (
          select g.event_name x, ${getDateTruncSQL('g.ts', unit, timezone)} t, sum(g.events) y
          from g
          ${
            limit
              ? `where g.event_name in (
                  select event_name from g group by 1 order by sum(events) desc limit ${limit}
                )`
              : ''
          }
          group by 1, 2
        ) t
        order by 2
        `,
        { ...queryParams, hstart: range.hstart, hend: range.hend },
        FUNCTION_NAME,
      );
    }
  }

  const limitQuery = limit
    ? `and event_name in (
    select event_name
    from website_event
    where website_id = {{websiteId::uuid}}
      and created_at between {{startDate}} and {{endDate}}
      and event_type = 2
    group by event_name
    order by count(*) desc
    limit ${limit}
  )`
    : '';

  // Truncate per row (cheap), format per group (expensive): to_char over
  // every scanned row dominates CPU on large date ranges.
  return rawQuery(
    `
    select
      t.x,
      ${getDateFormatSQL('t.t', unit, timezone)} t,
      t.y
    from (
      select
        event_name x,
        ${getDateTruncSQL('website_event.created_at', unit, timezone)} t,
        count(*) y
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{startDate}} and {{endDate}}
        and website_event.event_type = 2
        ${filterQuery}
        ${limitQuery}
      group by 1, 2
    ) t
    order by 2
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: EventStatsParameters,
  filters: QueryFilters,
): Promise<{ x: string; t: string; y: number }[]> {
  const { limit } = parameters;
  const { timezone = 'UTC', unit = 'day' } = filters;
  const { rawQuery, getDateSQL, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const limitQuery = limit
    ? `and event_name in (
    select event_name
    from website_event
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = 2
    group by event_name
    order by count(*) desc
    limit ${limit}
  )`
    : '';

  let sql = '';

  if (filterQuery || cohortQuery) {
    sql = `
    select
      event_name x,
      ${getDateSQL('created_at', unit, timezone)} t,
      count(*) y
    from website_event
    ${cohortQuery}
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      and event_type = 2
      ${filterQuery}
      ${limitQuery}
    group by x, t
    order by t
    `;
  } else {
    sql = `
    select
      event_name x,
      ${getDateSQL('created_at', unit, timezone)} t,
      count(*) y
    from (
      select arrayJoin(event_name) as event_name,
        created_at
      from website_event_stats_hourly website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = 2
        ${limitQuery}
    ) as g
    group by x, t
    order by t
    `;
  }

  return rawQuery(sql, queryParams, FUNCTION_NAME);
}
