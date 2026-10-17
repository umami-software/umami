import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { getRollupRange, getRollupWatermark, logRollupError } from '@/lib/rollups';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getWebsiteEventStats';

export interface WebsiteEventStatsData {
  events: number;
  visitors: number;
  visits: number;
  uniqueEvents: number;
}

export async function getWebsiteEventStats(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<WebsiteEventStatsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteEventStatsData[]> {
  const { parseFilters, rawQuery } = prisma;
  const { filterQuery, joinSessionQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  // Opt-in rollup path (ROLLUPS_ENABLED): events/uniqueEvents from the
  // event-name tier, visitors/visits from the visit-grain tier, raw tail
  // merged past the watermark. Identical numbers to the raw path.
  if (!filterQuery && !cohortQuery && !joinSessionQuery) {
    const watermark = await getRollupWatermark();
    const range = watermark && getRollupRange(filters.startDate, filters.endDate, watermark);

    if (range) {
      // Watermark freshness does not guarantee the rollup tables are intact
      // (e.g. dropped or being rebuilt); fall back to the raw path on error.
      try {
        return await rawQuery(
          `
          select e."events", v."visitors", v."visits", e."uniqueEvents"
          from (
            select
              cast(coalesce(sum(g.events), 0) as bigint) as "events",
              count(distinct g.event_name) as "uniqueEvents"
            from (
              select nullif(event_name, '') as event_name, events
              from website_event_rollup_hourly
              where website_id = {{websiteId::uuid}}
                and bucket >= {{hstart}}
                and bucket < {{hend}}
                and event_type = 2
              union all
              select event_name, count(*)
              from website_event
              where website_id = {{websiteId::uuid}}
                and ((created_at >= {{startDate}} and created_at < {{hstart}})
                  or (created_at >= {{hend}} and created_at <= {{endDate}}))
                and event_type = 2
              group by 1
            ) g
          ) e
          cross join (
            select
              count(distinct g.session_id) as "visitors",
              count(distinct g.visit_id) as "visits"
            from (
              select session_id, visit_id
              from website_visit_rollup_hourly
              where website_id = {{websiteId::uuid}}
                and bucket >= {{hstart}}
                and bucket < {{hend}}
                and event_views > 0
              union all
              select distinct session_id, visit_id
              from website_event
              where website_id = {{websiteId::uuid}}
                and ((created_at >= {{startDate}} and created_at < {{hstart}})
                  or (created_at >= {{hend}} and created_at <= {{endDate}}))
                and event_type = 2
            ) g
          ) v
          `,
          { ...queryParams, hstart: range.hstart, hend: range.hend },
          FUNCTION_NAME,
        ).then(result => result?.[0]);
      } catch (e) {
        logRollupError(e);
      }
    }
  }

  return rawQuery(
    `
    select
      cast(count(*) as bigint) as "events",
      count(distinct website_event.session_id) as "visitors",
      count(distinct website_event.visit_id) as "visits",
      count(distinct website_event.event_name) as "uniqueEvents"
    from website_event
    ${cohortQuery}
    ${joinSessionQuery}
    where website_event.website_id = {{websiteId::uuid}}
      and website_event.created_at between {{startDate}} and {{endDate}}
      and website_event.event_type = 2
      ${filterQuery}
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<WebsiteEventStatsData[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
  });

  const sql = filterQuery || cohortQuery
    ? `
      select
        count(*) as "events",
        uniq(session_id) as "visitors",
        uniq(visit_id) as "visits",
        uniq(event_name) as "uniqueEvents"
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = 2
        ${filterQuery};
      `
    : `
      select
        sum(length(event_name)) as "events",
        uniq(session_id) as "visitors",
        uniq(visit_id) as "visits",
        uniqArray(event_name) as "uniqueEvents"
      from website_event_stats_hourly website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = 2;
      `;

  return rawQuery(sql, queryParams, FUNCTION_NAME).then(result => result?.[0]);
}
