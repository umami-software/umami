import clickhouse from '@/lib/clickhouse';
import {
  EMAIL_DOMAINS,
  EVENT_TYPE,
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
import type { RevenuParameters } from './getRevenueChart';

export interface RevenueMetricsResult {
  country: { name: string; value: number }[];
  region: { name: string; value: number; country: string }[];
  referrer: { name: string; value: number }[];
  channel: { name: string; value: number }[];
}

export type RevenueMetricType = keyof RevenueMetricsResult;

export async function getRevenueMetrics(
  ...args: [
    websiteId: string,
    parameters: RevenuParameters,
    filters: QueryFilters,
    type: RevenueMetricType,
  ]
) {
  return runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });
}

async function relationalQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
  type: RevenueMetricType,
): Promise<RevenueMetricsResult[RevenueMetricType]> {
  const { startDate, endDate, currency } = parameters;
  const { rawQuery, parseFilters } = prisma;
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });
  const filteredSessionsQuery = `
    filtered_sessions as (
      select distinct website_event.website_id, website_event.session_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.event_type != ${EVENT_TYPE.performance}
      ${dateQuery}
      ${filterQuery}
    )
  `;
  const filteredRevenueQuery = `
    filtered_revenue as (
      select revenue.website_id, revenue.session_id, revenue.created_at, revenue.revenue
      from revenue
      join filtered_sessions
        on filtered_sessions.website_id = revenue.website_id
       and filtered_sessions.session_id = revenue.session_id
      where revenue.website_id = {{websiteId::uuid}}
        and revenue.created_at between {{startDate}} and {{endDate}}
        and upper(revenue.currency) = {{currency}}
    )
  `;

  if (type === 'country') {
    return rawQuery(
      `
      with
      ${filteredSessionsQuery},
      ${filteredRevenueQuery}
      select
        session.country as "name",
        sum(filtered_revenue.revenue) as "value"
      from filtered_revenue
      join session
        on session.website_id = filtered_revenue.website_id
          and session.session_id = filtered_revenue.session_id
      group by session.country
      order by value desc
      `,
      queryParams,
    );
  }

  if (type === 'region') {
    return rawQuery(
      `
      with
      ${filteredSessionsQuery},
      ${filteredRevenueQuery}
      select
        session.country,
        session.region as "name",
        sum(filtered_revenue.revenue) as "value"
      from filtered_revenue
      join session
        on session.website_id = filtered_revenue.website_id
          and session.session_id = filtered_revenue.session_id
      group by session.country, session.region
      order by value desc
      `,
      queryParams,
    );
  }

  if (type === 'referrer') {
    return rawQuery(
      `
      with
      ${filteredSessionsQuery},
      events as (
        select
          revenue.website_id,
          revenue.session_id,
          sum(revenue.revenue) as "value"
        from revenue
        join filtered_sessions
          on filtered_sessions.website_id = revenue.website_id
         and filtered_sessions.session_id = revenue.session_id
        where revenue.website_id = {{websiteId::uuid}}
          and revenue.created_at between {{startDate}} and {{endDate}}
          and upper(revenue.currency) = {{currency}}
        group by revenue.website_id, revenue.session_id),

      revenue_data as (
        select
          e.website_id,
          e.session_id,
          e.value,
          we.min_date as created_at
        from events e
        join (
          select session_id, min(created_at) as min_date
          from website_event
          where website_id = {{websiteId::uuid}}
            and created_at between {{startDate}} and {{endDate}}
          group by session_id
        ) we on we.session_id = e.session_id)

      select
        we.referrer_domain as "name",
        sum(revenue_data.value) as "value"
      from revenue_data
      join (
        select website_id, session_id, referrer_domain, created_at
        from website_event
        where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}) we
      on we.website_id = revenue_data.website_id
        and we.session_id = revenue_data.session_id
        and we.created_at = revenue_data.created_at
      group by we.referrer_domain
      order by value desc
      `,
      queryParams,
    );
  }

  return rawQuery(
    `
    with
    ${filteredSessionsQuery},
    events as (
      select
        revenue.website_id,
        revenue.session_id,
        sum(revenue.revenue) as "value"
      from revenue
      join filtered_sessions
        on filtered_sessions.website_id = revenue.website_id
       and filtered_sessions.session_id = revenue.session_id
      where revenue.website_id = {{websiteId::uuid}}
        and revenue.created_at between {{startDate}} and {{endDate}}
        and upper(revenue.currency) = {{currency}}
      group by revenue.website_id, revenue.session_id),

    revenue_data as (
      select
        e.website_id,
        e.session_id,
        e.value,
        we.min_date as created_at
      from events e
      join (
        select session_id, min(created_at) as min_date
        from website_event
        where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}
        group by session_id
      ) we on we.session_id = e.session_id),

    revenue_prefix as (
      select
        case when we.utm_medium ilike '%cp%' OR
              we.utm_medium ilike '%ppc%' OR
              we.utm_medium ilike '%retargeting%' OR
              we.utm_medium ilike '%paid%' then 'paid' else 'organic' end AS prefix,
        we.referrer_domain,
        we.url_query,
        we.utm_medium,
        we.utm_source,
        we.hostname,
        r.value
      from revenue_data r
      join (
        select website_id, session_id, referrer_domain, url_query, utm_medium, utm_source, hostname, created_at
        from website_event
        where website_id = {{websiteId::uuid}}
          and created_at between {{startDate}} and {{endDate}}) we
      on we.website_id = r.website_id
        and we.session_id = r.session_id
        and we.created_at = r.created_at),

    channels AS (
      select
        case
          when referrer_domain = '' and url_query = '' then 'direct'
          when ${toPostgresLikeClause('url_query', PAID_AD_PARAMS)} then 'paidAds'
          when ${toPostgresLikeClause('utm_medium', ['referral', 'app', 'link'])} then 'referral'
          when utm_medium ilike '%affiliate%' then 'affiliate'
          when utm_medium ilike '%sms%' or utm_source ilike '%sms%' then 'sms'
          when ${toPostgresLikeClause('referrer_domain', LLM_DOMAINS)} then 'llm'
          when ${toPostgresLikeClause('referrer_domain', SEARCH_DOMAINS)} or utm_medium ilike '%organic%' then concat(prefix, 'Search')
          when ${toPostgresLikeClause('referrer_domain', SOCIAL_DOMAINS)} then concat(prefix, 'Social')
          when ${toPostgresLikeClause('referrer_domain', EMAIL_DOMAINS)} or utm_medium ilike '%mail%' then 'email'
          when ${toPostgresLikeClause('referrer_domain', SHOPPING_DOMAINS)} or utm_medium ilike '%shop%' then concat(prefix, 'Shopping')
          when ${toPostgresLikeClause('referrer_domain', VIDEO_DOMAINS)} or utm_medium ilike '%video%' then concat(prefix, 'Video')
          when referrer_domain != regexp_replace(hostname, '^www.', '') and referrer_domain != '' then 'referral'
          else 'Unknown' end AS "name",
        value
      from revenue_prefix)

    select name, sum(value) as value
    from channels
    group by name
    order by value desc
    `,
    queryParams,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: RevenuParameters,
  filters: QueryFilters,
  type: RevenueMetricType,
): Promise<RevenueMetricsResult[RevenueMetricType]> {
  const { startDate, endDate, currency } = parameters;
  const { rawQuery, parseFilters } = clickhouse;
  const { filterQuery, cohortQuery, dateQuery, queryParams } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
    currency,
  });
  const filteredSessionsQuery = `
    filtered_sessions as (
      select
        website_id,
        session_id,
        any(country) as country,
        any(region) as region
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and event_type != ${EVENT_TYPE.performance}
      ${dateQuery}
      ${filterQuery}
      group by website_id, session_id
    )
  `;
  const filteredRevenueQuery = `
    filtered_revenue as (
      select
        website_revenue.website_id,
        website_revenue.session_id,
        website_revenue.created_at,
        website_revenue.revenue
      from website_revenue
      any inner join filtered_sessions
        on filtered_sessions.website_id = website_revenue.website_id
       and filtered_sessions.session_id = website_revenue.session_id
      where website_revenue.website_id = {websiteId:UUID}
        and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and upper(website_revenue.currency) = {currency:String}
    )
  `;

  if (type === 'country') {
    return rawQuery<{ name: string; value: number }[]>(
      `
      with
      ${filteredSessionsQuery},
      ${filteredRevenueQuery}
      select
        filtered_sessions.country as "name",
        sum(filtered_revenue.revenue) as "value"
      from filtered_revenue
      any inner join filtered_sessions
        on filtered_sessions.website_id = filtered_revenue.website_id
       and filtered_sessions.session_id = filtered_revenue.session_id
      group by filtered_sessions.country
      order by value desc
      `,
      queryParams,
    );
  }

  if (type === 'region') {
    return rawQuery<{ name: string; value: number; country: string }[]>(
      `
      with
      ${filteredSessionsQuery},
      ${filteredRevenueQuery}
      select
        filtered_sessions.country,
        filtered_sessions.region as "name",
        sum(filtered_revenue.revenue) as "value"
      from filtered_revenue
      any inner join filtered_sessions
        on filtered_sessions.website_id = filtered_revenue.website_id
       and filtered_sessions.session_id = filtered_revenue.session_id
      group by 1, 2
      order by value desc
      `,
      queryParams,
    );
  }

  if (type === 'referrer') {
    return rawQuery<{ name: string; value: number }[]>(
      `
      with
      ${filteredSessionsQuery},
      events as (
        select
          website_revenue.website_id,
          website_revenue.session_id,
          sum(website_revenue.revenue) as "value"
        from website_revenue
        any inner join filtered_sessions
          on filtered_sessions.website_id = website_revenue.website_id
         and filtered_sessions.session_id = website_revenue.session_id
        where website_revenue.website_id = {websiteId:UUID}
          and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and upper(website_revenue.currency) = {currency:String}
        group by 1, 2
      ),

      revenue as (
        select
          e.website_id,
          e.session_id,
          e.value,
          we.min_date as created_at
        from events e
        join (
          select session_id, min(created_at) min_date
          from website_event
          where website_id = {websiteId:UUID}
            and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          group by 1
        ) we
          on we.session_id = e.session_id
      )

      select
          website_event.referrer_domain as "name",
          sum(revenue.value) as "value"
      from revenue
      any left join (
        select website_id, session_id, referrer_domain, created_at
        from website_event
        where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}) website_event
      on website_event.website_id = revenue.website_id
      and website_event.session_id = revenue.session_id
      and website_event.created_at = revenue.created_at
      group by 1
      order by value desc
      `,
      queryParams,
    );
  }

  return rawQuery<{ name: string; value: number }[]>(
    `
    with
    ${filteredSessionsQuery},
    events as (
      select
        website_revenue.website_id,
        website_revenue.session_id,
        sum(website_revenue.revenue) as "value"
      from website_revenue
      any inner join filtered_sessions
        on filtered_sessions.website_id = website_revenue.website_id
       and filtered_sessions.session_id = website_revenue.session_id
      where website_revenue.website_id = {websiteId:UUID}
        and website_revenue.created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and upper(website_revenue.currency) = {currency:String}
      group by 1, 2
    ),

    revenue as (
      select
          e.website_id,
          e.session_id,
          e.value,
          we.min_date as created_at
      from events e
      join (
        select session_id, min(created_at) min_date
        from website_event
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        group by 1
      ) we
        on we.session_id = e.session_id
    ),

    channels as (
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
        else 'Unknown' end AS "name",
        sum(revenue.value) as "value"
      from revenue
      any left join (
        select *
        from website_event
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
      ) website_event
        on website_event.website_id = revenue.website_id
       and website_event.session_id = revenue.session_id
       and website_event.created_at = revenue.created_at
      group by 1, 2
    )

    select name, sum(value) value
    from channels
    group by 1
    order by value desc;
    `,
    queryParams,
  );
}

function toClickHouseStringArray(arr: string[]): string {
  return arr.map(p => `'${p.replace(/'/g, "\\'")}'`).join(', ');
}

function toPostgresLikeClause(column: string, arr: string[]) {
  return arr.map(val => `${column} ilike '%${val.replace(/'/g, "''")}%'`).join(' OR\n  ');
}
