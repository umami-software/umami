import clickhouse from '@/lib/clickhouse';
import {
  EMAIL_DOMAINS,
  LLM_DOMAINS,
  PAID_AD_PARAMS,
  SEARCH_DOMAINS,
  SHOPPING_DOMAINS,
  SOCIAL_DOMAINS,
  VIDEO_DOMAINS,
} from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

const FUNCTION_NAME = 'getChannelExpandedMetrics';

export interface ChannelExpandedMetricsParameters {
  limit?: number | string;
  offset?: number | string;
}

export interface ChannelExpandedMetricsData {
  name: string;
  pageviews: number;
  visitors: number;
  visits: number;
  bounces: number;
  totaltime: number;
}

export async function getChannelExpandedMetrics(
  ...args: [websiteId: string, filters?: QueryFilters]
): Promise<ChannelExpandedMetricsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<ChannelExpandedMetricsData[]> {
  const { rawQuery, parseFilters, getTimestampDiffSQL } = prisma;
  const { queryParams, filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, dateQuery } =
    parseFilters({
      ...filters,
      websiteId,
    });

  return rawQuery(
    `
      WITH prefix AS (
        select case when website_event.utm_medium LIKE 'p%' OR
            website_event.utm_medium LIKE '%ppc%' OR
            website_event.utm_medium LIKE '%retargeting%' OR
            website_event.utm_medium LIKE '%paid%' then 'paid' else 'organic' end prefix,
            website_event.referrer_domain,
            website_event.url_query,
            website_event.utm_medium,
            website_event.utm_source,
            website_event.session_id,
            website_event.visit_id,
            website_event.hostname,
            website_event.event_id,
            website_event.created_at
        from website_event
        ${cohortQuery}
        ${excludeBounceQuery}
        ${joinSessionQuery}
        where website_event.website_id = {{websiteId::uuid}}
          and website_event.event_type NOT IN (2, 5)
          ${dateQuery}
          ${filterQuery}),
  
      channels as (
        select case
            when referrer_domain = '' and url_query = '' then 'direct'
            when ${toPostgresPositionClause('url_query', PAID_AD_PARAMS)} then 'paidAds'
            when ${toPostgresPositionClause('utm_medium', ['referral', 'app', 'link'])} then 'referral'
            when utm_medium ilike '%affiliate%' then 'affiliate'
            when utm_medium ilike '%sms%' or utm_source ilike '%sms%' then 'sms'
            when ${toPostgresPositionClause('referrer_domain', LLM_DOMAINS)} then 'llm'
            when ${toPostgresPositionClause('referrer_domain', SEARCH_DOMAINS)} or utm_medium ilike '%organic%' then concat(prefix, 'Search')
            when ${toPostgresPositionClause('referrer_domain', SOCIAL_DOMAINS)} then concat(prefix, 'Social')
            when ${toPostgresPositionClause('referrer_domain', EMAIL_DOMAINS)} or utm_medium ilike '%mail%' then 'email'
            when ${toPostgresPositionClause('referrer_domain', SHOPPING_DOMAINS)} or utm_medium ilike '%shop%' then concat(prefix, 'Shopping')
            when ${toPostgresPositionClause('referrer_domain', VIDEO_DOMAINS)} or utm_medium ilike '%video%' then concat(prefix, 'Video')
            when referrer_domain != regexp_replace(hostname, '^www.', '') and referrer_domain != '' then 'referral'
            else '' end as "name",
            session_id,
            visit_id,
            event_id,
            created_at
        from prefix),

      visit_channels as (
        select
          session_id,
          visit_id,
          coalesce(nullif(name, ''), 'direct') as "name"
        from (
          select
            name,
            session_id,
            visit_id,
            row_number() over (
              partition by session_id, visit_id
              order by case when name != '' then 0 else 1 end, created_at, event_id
            ) as row_num
          from channels
        ) as ranked_channels
        where row_num = 1),

      visit_stats as (
        select
          session_id,
          visit_id,
          count(*) as c,
          min(created_at) as min_time,
          max(created_at) as max_time
        from prefix
        group by session_id, visit_id)
  
      select
        visit_channels.name,
        sum(visit_stats.c) as "pageviews",
        count(distinct visit_stats.session_id) as "visitors",
        count(distinct visit_stats.visit_id) as "visits",
        sum(case when visit_stats.c = 1 then 1 else 0 end) as "bounces",
        sum(${getTimestampDiffSQL('visit_stats.min_time', 'visit_stats.max_time')}) as "totaltime"
      from visit_stats
      join visit_channels
        on visit_channels.session_id = visit_stats.session_id
        and visit_channels.visit_id = visit_stats.visit_id
      group by visit_channels.name 
      order by visitors desc, visits desc
      `,
    queryParams,
    FUNCTION_NAME,
  ).then(results => results.map(item => ({ ...item, y: Number(item.y) })));
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<ChannelExpandedMetricsData[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { queryParams, filterQuery, cohortQuery, excludeBounceQuery } = parseFilters({
    ...filters,
    websiteId,
  });

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
        session_id,
        visit_id,
        coalesce(nullIf(argMin(name, tuple(if(name != '', 0, 1), created_at, event_id)), ''), 'direct') as name,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from (
        select
        case when multiSearchAny(lower(utm_medium), ['cp', 'ppc', 'retargeting', 'paid']) != 0 then 'paid' else 'organic' end prefix,
        case
          when referrer_domain = '' and url_query = '' then 'direct'
          when multiSearchAny(lower(url_query), [${toClickHouseStringArray(
            PAID_AD_PARAMS,
          )}]) != 0 then 'paidAds'
          when multiSearchAny(lower(utm_medium), ['referral', 'app','link']) != 0 then 'referral'
          when position(lower(utm_medium), 'affiliate') > 0 then 'affiliate'
          when position(lower(utm_medium), 'sms') > 0 or position(lower(utm_source), 'sms') > 0 then 'sms'
          when multiSearchAny(lower(referrer_domain), [${toClickHouseStringArray(
            LLM_DOMAINS,
          )}]) != 0 then 'llm'
          when multiSearchAny(lower(referrer_domain), [${toClickHouseStringArray(
            SEARCH_DOMAINS,
          )}]) != 0 or position(lower(utm_medium), 'organic') > 0 then concat(prefix, 'Search')
          when multiSearchAny(lower(referrer_domain), [${toClickHouseStringArray(
            SOCIAL_DOMAINS,
          )}]) != 0 then concat(prefix, 'Social')
          when multiSearchAny(lower(referrer_domain), [${toClickHouseStringArray(
            EMAIL_DOMAINS,
          )}]) != 0 or position(lower(utm_medium), 'mail') > 0 then 'email'
          when multiSearchAny(lower(referrer_domain), [${toClickHouseStringArray(
            SHOPPING_DOMAINS,
          )}]) != 0 or position(lower(utm_medium), 'shop') > 0 then concat(prefix, 'Shopping')
          when multiSearchAny(lower(referrer_domain), [${toClickHouseStringArray(
            VIDEO_DOMAINS,
          )}]) != 0 or position(lower(utm_medium), 'video') > 0 then concat(prefix, 'Video')
          when referrer_domain != hostname and referrer_domain != '' then 'referral'
        else '' end AS "name",
        session_id,
        visit_id,
        event_id,
        created_at
        from website_event
        ${cohortQuery}
        ${excludeBounceQuery}
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and event_type NOT IN (2, 5)
          ${filterQuery}
      )
      group by session_id, visit_id
    ) as t
    group by name 
    order by visitors desc, visits desc;
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

function toClickHouseStringArray(arr: string[]): string {
  return arr.map(p => `'${p.replace(/'/g, "\\'")}'`).join(', ');
}

function toPostgresPositionClause(column: string, arr: string[]) {
  return arr.map(val => `${column} ilike '%${val.replace(/'/g, "''")}%'`).join(' OR\n  ');
}
