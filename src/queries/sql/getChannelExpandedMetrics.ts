import clickhouse from '@/lib/clickhouse';
import {
  EMAIL_DOMAINS,
  PAID_AD_PARAMS,
  SEARCH_DOMAINS,
  SHOPPING_DOMAINS,
  SOCIAL_DOMAINS,
  VIDEO_DOMAINS,
} from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

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
  const { queryParams, filterQuery, joinSessionQuery, cohortQuery, dateQuery } = parseFilters({
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
            count(*) c,
            min(website_event.created_at) min_time,
            max(website_event.created_at) max_time
        from website_event
        ${cohortQuery}
        ${joinSessionQuery}
        where website_event.website_id = {{websiteId::uuid}}
          and website_event.event_type != 2
          ${dateQuery}
          ${filterQuery}
        group by prefix, 
            website_event.referrer_domain,
            website_event.url_query,
            website_event.utm_medium,
            website_event.utm_source,
            website_event.session_id,
            website_event.visit_id),
  
      channels as (
        select case
            when referrer_domain = '' and url_query = '' then 'direct'
            when ${toPostgresPositionClause('url_query', PAID_AD_PARAMS)} then 'paidAds'
            when ${toPostgresPositionClause('utm_medium', ['referral', 'app', 'link'])} then 'referral'
            when utm_medium ilike '%affiliate%' then 'affiliate'
            when utm_medium ilike '%sms%' or utm_source ilike '%sms%' then 'sms'
            when ${toPostgresPositionClause('referrer_domain', SEARCH_DOMAINS)} or utm_medium ilike '%organic%' then concat(prefix, 'Search')
            when ${toPostgresPositionClause('referrer_domain', SOCIAL_DOMAINS)} then concat(prefix, 'Social')
            when ${toPostgresPositionClause('referrer_domain', EMAIL_DOMAINS)} or utm_medium ilike '%mail%' then 'email'
            when ${toPostgresPositionClause('referrer_domain', SHOPPING_DOMAINS)} or utm_medium ilike '%shop%' then concat(prefix, 'Shopping')
            when ${toPostgresPositionClause('referrer_domain', VIDEO_DOMAINS)} or utm_medium ilike '%video%' then concat(prefix, 'Video')
            else '' end AS name,
            session_id,
            visit_id,
            c,
            min_time,
            max_time
        from prefix)
  
      select
        name,
        sum(c) as "pageviews",
        count(distinct session_id) as "visitors",
        count(distinct visit_id) as "visits",
        sum(case when c = 1 then 1 else 0 end) as "bounces",
        sum(${getTimestampDiffSQL('min_time', 'max_time')}) as "totaltime"
      from channels
      where name != ''
      group by name 
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
  const { queryParams, filterQuery, cohortQuery } = parseFilters({
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
      select case when multiSearchAny(utm_medium, ['cp', 'ppc', 'retargeting', 'paid']) != 0 then 'paid' else 'organic' end prefix,
          case
          when referrer_domain = '' and url_query = '' then 'direct'
          when multiSearchAny(url_query, [${toClickHouseStringArray(
            PAID_AD_PARAMS,
          )}]) != 0 then 'paidAds'
          when multiSearchAny(utm_medium, ['referral', 'app','link']) != 0 then 'referral'
          when position(utm_medium, 'affiliate') > 0 then 'affiliate'
          when position(utm_medium, 'sms') > 0 or position(utm_source, 'sms') > 0 then 'sms'
          when multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            SEARCH_DOMAINS,
          )}]) != 0 or position(utm_medium, 'organic') > 0 then concat(prefix, 'Search')
          when multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            SOCIAL_DOMAINS,
          )}]) != 0 then concat(prefix, 'Social')
          when multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            EMAIL_DOMAINS,
          )}]) != 0 or position(utm_medium, 'mail') > 0 then 'email'
          when multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            SHOPPING_DOMAINS,
          )}]) != 0 or position(utm_medium, 'shop') > 0 then concat(prefix, 'Shopping')
          when multiSearchAny(referrer_domain, [${toClickHouseStringArray(
            VIDEO_DOMAINS,
          )}]) != 0 or position(utm_medium, 'video') > 0 then concat(prefix, 'Video')
          else '' end AS name,
        session_id,
        visit_id,
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type != 2
        and name != ''
        ${filterQuery}
      group by prefix, name, session_id, visit_id
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
