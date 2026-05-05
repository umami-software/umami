import clickhouse from '@/lib/clickhouse';
import {
  EMAIL_DOMAINS,
  PAID_AD_PARAMS,
  SEARCH_DOMAINS,
  SHOPPING_DOMAINS,
  SOCIAL_DOMAINS,
  VIDEO_DOMAINS,
} from '@/lib/constants';
import { CLICKHOUSE, OCEANBASE, PRISMA, runQuery } from '@/lib/db';
import oceanbase from '@/lib/oceanbase';
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
    [OCEANBASE]: () => oceanbaseQuery(...args),
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
            count(*) c,
            min(website_event.created_at) min_time,
            max(website_event.created_at) max_time
        from website_event
        ${cohortQuery}
        ${excludeBounceQuery}
        ${joinSessionQuery}
        where website_event.website_id = {{websiteId::uuid}}
          and website_event.event_type NOT IN (2, 5)
          ${dateQuery}
          ${filterQuery}
        group by prefix, 
            website_event.referrer_domain,
            website_event.url_query,
            website_event.utm_medium,
            website_event.utm_source,
            website_event.session_id,
            website_event.visit_id,
            website_event.hostname),
  
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
            when referrer_domain != regexp_replace(hostname, '^www.', '') and referrer_domain != '' then 'referral'
            else '' end as "name",
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
  ).then(results => results as ChannelExpandedMetricsData[]);
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
        count(*) c,
        min(created_at) min_time,
        max(created_at) max_time
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type NOT IN (2, 5)
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

function toOceanBasePositionClause(column: string, arr: string[]) {
  return arr.map(val => `LOWER(${column}) LIKE '%${val.toLowerCase()}%'`).join(' OR\n  ');
}

async function oceanbaseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<ChannelExpandedMetricsData[]> {
  const { rawQuery, parseFilters, getTimestampDiffSQL } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, dateQuery, buildParams, getDateParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  const params = buildParams([websiteId, ...getDateParams()]);

  return rawQuery<ChannelExpandedMetricsData[]>(
    `
    WITH prefix AS (
      SELECT CASE WHEN website_event.utm_medium LIKE 'p%' OR
          website_event.utm_medium LIKE '%ppc%' OR
          website_event.utm_medium LIKE '%retargeting%' OR
          website_event.utm_medium LIKE '%paid%' THEN 'paid' ELSE 'organic' END prefix,
          website_event.referrer_domain,
          website_event.url_query,
          website_event.utm_medium,
          website_event.utm_source,
          website_event.session_id,
          website_event.visit_id,
          website_event.hostname,
          COUNT(*) c,
          MIN(website_event.created_at) min_time,
          MAX(website_event.created_at) max_time
      FROM website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = ?
        AND website_event.event_type NOT IN (2, 5)
        ${dateQuery}
        ${filterQuery}
      GROUP BY prefix,
          website_event.referrer_domain,
          website_event.url_query,
          website_event.utm_medium,
          website_event.utm_source,
          website_event.session_id,
          website_event.visit_id,
          website_event.hostname),

    channels AS (
      SELECT CASE
          WHEN referrer_domain = '' AND url_query = '' THEN 'direct'
          WHEN ${toOceanBasePositionClause('url_query', PAID_AD_PARAMS)} THEN 'paidAds'
          WHEN ${toOceanBasePositionClause('utm_medium', ['referral', 'app', 'link'])} THEN 'referral'
          WHEN LOWER(utm_medium) LIKE '%affiliate%' THEN 'affiliate'
          WHEN LOWER(utm_medium) LIKE '%sms%' OR LOWER(utm_source) LIKE '%sms%' THEN 'sms'
          WHEN ${toOceanBasePositionClause('referrer_domain', SEARCH_DOMAINS)} OR LOWER(utm_medium) LIKE '%organic%' THEN CONCAT(prefix, 'Search')
          WHEN ${toOceanBasePositionClause('referrer_domain', SOCIAL_DOMAINS)} THEN CONCAT(prefix, 'Social')
          WHEN ${toOceanBasePositionClause('referrer_domain', EMAIL_DOMAINS)} OR LOWER(utm_medium) LIKE '%mail%' THEN 'email'
          WHEN ${toOceanBasePositionClause('referrer_domain', SHOPPING_DOMAINS)} OR LOWER(utm_medium) LIKE '%shop%' THEN CONCAT(prefix, 'Shopping')
          WHEN ${toOceanBasePositionClause('referrer_domain', VIDEO_DOMAINS)} OR LOWER(utm_medium) LIKE '%video%' THEN CONCAT(prefix, 'Video')
          WHEN referrer_domain != REGEXP_REPLACE(hostname, '^www.', '') AND referrer_domain != '' THEN 'referral'
          ELSE '' END AS name,
          session_id,
          visit_id,
          c,
          min_time,
          max_time
      FROM prefix)

    SELECT
      name,
      SUM(c) AS pageviews,
      COUNT(DISTINCT session_id) AS visitors,
      COUNT(DISTINCT visit_id) AS visits,
      SUM(CASE WHEN c = 1 THEN 1 ELSE 0 END) AS bounces,
      SUM(${getTimestampDiffSQL('min_time', 'max_time')}) AS totaltime
    FROM channels
    WHERE name != ''
    GROUP BY name
    ORDER BY visitors DESC, visits DESC
    `,
    params,
    FUNCTION_NAME,
  ).then(results => results as ChannelExpandedMetricsData[]);
}
