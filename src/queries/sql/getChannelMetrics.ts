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

export async function getChannelMetrics(...args: [websiteId: string, filters?: QueryFilters]) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { rawQuery, parseFilters } = prisma;
  const { params, filterQuery, cohortQuery, dateQuery } = await parseFilters(websiteId, filters);

  return rawQuery(
    `
    select
      referrer_domain as domain,
      url_query as query,
      count(distinct session_id) as visitors
    from website_event
    ${cohortQuery}
    where website_id = {{websiteId::uuid}}
        ${filterQuery}
        ${dateQuery}
    group by 1, 2
    order by visitors desc
    `,
    params,
  );
}

async function clickhouseQuery(
  websiteId: string,
  filters: QueryFilters,
): Promise<{ x: string; y: number }[]> {
  const { rawQuery, parseFilters } = clickhouse;
  const { params, filterQuery, cohortQuery } = await parseFilters(websiteId, {
    ...filters,
    eventType: EVENT_TYPE.pageView,
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
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and event_type = {eventType:UInt32}
          ${filterQuery}
      group by 1, 2
      order by y desc)

    select x, sum(y) y
    from channels
    where x != ''
    group by x
    order by y desc;
  `;

  return rawQuery(sql, params);
}

function toClickHouseStringArray(arr: string[]): string {
  return arr.map(p => `'${p.replace(/'/g, "\\'")}'`).join(', ');
}
