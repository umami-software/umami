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

const FUNCTION_NAME = 'getChannelMetrics';

export async function getChannelMetrics(...args: [websiteId: string, filters?: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
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
          website_event.session_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.event_type != 2
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
  const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
  });

  const sql = `
    WITH channels as (
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
          else '' end AS x,
        count(distinct session_id) y
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and event_type != 2
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
