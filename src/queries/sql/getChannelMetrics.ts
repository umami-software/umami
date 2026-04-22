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

const FUNCTION_NAME = 'getChannelMetrics';

export async function getChannelMetrics(...args: [websiteId: string, filters?: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [OCEANBASE]: () => oceanbaseQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
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
          website_event.hostname
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
          when ${toPostgresLikeClause('url_query', PAID_AD_PARAMS)} then 'paidAds'
          when ${toPostgresLikeClause('utm_medium', ['referral', 'app', 'link'])} then 'referral'
          when utm_medium ilike '%affiliate%' then 'affiliate'
          when utm_medium ilike '%sms%' or utm_source ilike '%sms%' then 'sms'
          when ${toPostgresLikeClause('referrer_domain', SEARCH_DOMAINS)} or utm_medium ilike '%organic%' then concat(prefix, 'Search')
          when ${toPostgresLikeClause('referrer_domain', SOCIAL_DOMAINS)} then concat(prefix, 'Social')
          when ${toPostgresLikeClause('referrer_domain', EMAIL_DOMAINS)} or utm_medium ilike '%mail%' then 'email'
          when ${toPostgresLikeClause('referrer_domain', SHOPPING_DOMAINS)} or utm_medium ilike '%shop%' then concat(prefix, 'Shopping')
          when ${toPostgresLikeClause('referrer_domain', VIDEO_DOMAINS)} or utm_medium ilike '%video%' then concat(prefix, 'Video')
          when referrer_domain != regexp_replace(hostname, '^www.', '') and referrer_domain != '' then 'referral'
          else '' end AS x,
        count(distinct session_id) y
      from prefix
      group by 1
      order by y desc)

    select x, sum(y) y
    from channels
    where x != ''
    group by x
    order by y desc;
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(results => results.map(item => ({ ...item, y: Number(item.y) })));
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { queryParams, filterQuery, cohortQuery, excludeBounceQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
  });

  const sql = `
    WITH channels as (
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
        else '' end AS x,
        count(distinct session_id) y
      from website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      where website_id = {websiteId:UUID}
        and event_type NOT IN (2, 5)
        ${dateQuery}
        ${filterQuery}
      group by 1, 2
      order by y desc)

    select x, sum(y) y
    from channels
    where x != ''
    group by x
    order by y desc;
  `;

  return rawQuery(sql, queryParams, FUNCTION_NAME);
}

function toClickHouseStringArray(arr: string[]): string {
  return arr.map(p => `'${p.replace(/'/g, "\\'")}'`).join(', ');
}

function toPostgresLikeClause(column: string, arr: string[]) {
  return arr.map(val => `${column} ilike '%${val.replace(/'/g, "''")}%'`).join(' OR\n  ');
}

function toOceanBaseLikeClause(column: string, arr: string[]) {
  return arr.map(val => `LOWER(${column}) LIKE '%${val.toLowerCase()}%'`).join(' OR\n  ');
}

async function oceanbaseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { rawQuery, parseFilters } = oceanbase;
  const { filterQuery, joinSessionQuery, cohortQuery, excludeBounceQuery, dateQuery, buildParams, getDateParams } =
    parseFilters({
      ...filters,
      websiteId,
    });

  const params = buildParams([websiteId, ...getDateParams()]);

  return rawQuery<{ x: string; y: number }[]>(
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
          website_event.hostname
      FROM website_event
      ${cohortQuery}
      ${excludeBounceQuery}
      ${joinSessionQuery}
      WHERE website_event.website_id = ?
        AND website_event.event_type NOT IN (2, 5)
        ${dateQuery}
        ${filterQuery}),

    channels AS (
      SELECT CASE
          WHEN referrer_domain = '' AND url_query = '' THEN 'direct'
          WHEN ${toOceanBaseLikeClause('url_query', PAID_AD_PARAMS)} THEN 'paidAds'
          WHEN ${toOceanBaseLikeClause('utm_medium', ['referral', 'app', 'link'])} THEN 'referral'
          WHEN LOWER(utm_medium) LIKE '%affiliate%' THEN 'affiliate'
          WHEN LOWER(utm_medium) LIKE '%sms%' OR LOWER(utm_source) LIKE '%sms%' THEN 'sms'
          WHEN ${toOceanBaseLikeClause('referrer_domain', SEARCH_DOMAINS)} OR LOWER(utm_medium) LIKE '%organic%' THEN CONCAT(prefix, 'Search')
          WHEN ${toOceanBaseLikeClause('referrer_domain', SOCIAL_DOMAINS)} THEN CONCAT(prefix, 'Social')
          WHEN ${toOceanBaseLikeClause('referrer_domain', EMAIL_DOMAINS)} OR LOWER(utm_medium) LIKE '%mail%' THEN 'email'
          WHEN ${toOceanBaseLikeClause('referrer_domain', SHOPPING_DOMAINS)} OR LOWER(utm_medium) LIKE '%shop%' THEN CONCAT(prefix, 'Shopping')
          WHEN ${toOceanBaseLikeClause('referrer_domain', VIDEO_DOMAINS)} OR LOWER(utm_medium) LIKE '%video%' THEN CONCAT(prefix, 'Video')
          WHEN referrer_domain != REGEXP_REPLACE(hostname, '^www.', '') AND referrer_domain != '' THEN 'referral'
          ELSE '' END AS x,
        COUNT(DISTINCT session_id) y
      FROM prefix
      GROUP BY 1
      ORDER BY y DESC)

    SELECT x, SUM(y) y
    FROM channels
    WHERE x != ''
    GROUP BY x
    ORDER BY y DESC
    `,
    params,
    FUNCTION_NAME,
  ).then(results => results.map(item => ({ ...item, y: Number(item.y) })));
}
