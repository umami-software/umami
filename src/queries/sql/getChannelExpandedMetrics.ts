import clickhouse from '@/lib/clickhouse';
import {
  EMAIL_DOMAINS,
  EVENT_TYPE,
  PAID_AD_PARAMS,
  SEARCH_DOMAINS,
  SHOPPING_DOMAINS,
  SOCIAL_DOMAINS,
  VIDEO_DOMAINS,
} from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { QueryFilters } from '@/lib/types';

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
  ...args: [websiteId: string, parameters: ChannelExpandedMetricsParameters, filters?: QueryFilters]
): Promise<ChannelExpandedMetricsData[]> {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: ChannelExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<ChannelExpandedMetricsData[]> {
  const { rawQuery, parseFilters } = prisma;
  const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.pageView,
  });

  return rawQuery(
    `
    WITH channels as (
      select case when ${toPostgresPositionClause('utm_medium', ['cp', 'ppc', 'retargeting', 'paid'])} then 'paid' else 'organic' end prefix,
          case
          when referrer_domain = '' and url_query = '' then 'direct'
          when ${toPostgresPositionClause('url_query', PAID_AD_PARAMS)} then 'paidAds'
          when ${toPostgresPositionClause('utm_medium', ['referral', 'app', 'link'])} then 'referral'
          when position(utm_medium, 'affiliate') > 0 then 'affiliate'
          when position(utm_medium, 'sms') > 0 or position(utm_source, 'sms') > 0 then 'sms'
          when ${toPostgresPositionClause('referrer_domain', SEARCH_DOMAINS)} or position(utm_medium, 'organic') > 0 then concat(prefix, 'Search')
          when ${toPostgresPositionClause('referrer_domain', SOCIAL_DOMAINS)} then concat(prefix, 'Social')
          when ${toPostgresPositionClause('referrer_domain', EMAIL_DOMAINS)} or position(utm_medium, 'mail') > 0 then 'email'
          when ${toPostgresPositionClause('referrer_domain', SHOPPING_DOMAINS)} or position(utm_medium, 'shop') > 0 then concat(prefix, 'Shopping')
          when ${toPostgresPositionClause('referrer_domain', VIDEO_DOMAINS)} or position(utm_medium, 'video') > 0 then concat(prefix, 'Video')
          else '' end AS x,
        count(distinct session_id) y
      from website_event
      ${cohortQuery}
      where website_id = {{websiteId::uuid}}
        and event_type = {{eventType}}
        ${dateQuery}
        ${filterQuery}
      group by 1, 2
      order by y desc)

    select x, sum(y) y
    from channels
    where x != ''
    group by x
    order by y desc;
    `,
    { ...queryParams, ...parameters },
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: ChannelExpandedMetricsParameters,
  filters: QueryFilters,
): Promise<ChannelExpandedMetricsData[]> {
  const { limit = 500, offset = 0 } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const { queryParams, filterQuery, cohortQuery } = parseFilters({
    ...filters,
    websiteId,
    eventType: EVENT_TYPE.pageView,
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
        and name != ''
        ${filterQuery}
      group by prefix, name, session_id, visit_id
    ) as t
    group by name 
    order by visitors desc, visits desc
    limit ${limit}
    offset ${offset}
    `,
    { ...queryParams, ...parameters },
  );
}

function toClickHouseStringArray(arr: string[]): string {
  return arr.map(p => `'${p.replace(/'/g, "\\'")}'`).join(', ');
}

function toPostgresPositionClause(column: string, arr: string[]) {
  return arr.map(val => `position(${column}, '${val.replace(/'/g, "''")}') > 0`).join(' OR\n  ');
}
