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
import { isImportedRevenue } from './importedRevenue';

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
): Promise<RevenueMetricsResult[RevenueMetricType]> {
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

  // Revenue is credited to the session's first event in the range, preferring an event that
  // matches the traffic-source filters so a filtered breakdown agrees with the filter.
  const attributedQuery = `
    session_revenue as (
      select revenue.session_id, sum(revenue.revenue) as value
      from revenue
      join filtered_sessions
        on filtered_sessions.website_id = revenue.website_id
       and filtered_sessions.session_id = revenue.session_id
      where revenue.website_id = {{websiteId::uuid}}
        and revenue.created_at between {{startDate}} and {{endDate}}
        and upper(revenue.currency) = {{currency}}
      group by revenue.session_id
    ),
    first_event as (
      select distinct on (session_id)
        session_id, referrer_domain, url_query, utm_medium, utm_source, hostname
      from website_event
      where website_id = {{websiteId::uuid}}
        and created_at between {{startDate}} and {{endDate}}
        and session_id in (select session_id from session_revenue)
      order by session_id, case when ${getAttributionMatch(filters, parseFilters)} then 0 else 1 end, created_at
    ),
    attributed as (
      select
        session_revenue.value,
        first_event.referrer_domain,
        first_event.url_query,
        first_event.utm_medium,
        first_event.utm_source,
        first_event.hostname
      from session_revenue
      join first_event
        on first_event.session_id = session_revenue.session_id
    )
  `;

  if (type === 'referrer') {
    return rawQuery(
      `
      with
      ${filteredSessionsQuery},
      ${attributedQuery}
      select
        referrer_domain as "name",
        sum(value) as "value"
      from attributed
      group by referrer_domain
      order by value desc
      `,
      queryParams,
    );
  }

  return rawQuery(
    `
    with
    ${filteredSessionsQuery},
    ${attributedQuery},
    revenue_prefix as (
      select
        case when utm_medium ilike '%cp%' OR
              utm_medium ilike '%ppc%' OR
              utm_medium ilike '%retargeting%' OR
              utm_medium ilike '%paid%' then 'paid' else 'organic' end AS prefix,
        coalesce(referrer_domain, '') as referrer_domain,
        coalesce(url_query, '') as url_query,
        utm_medium,
        utm_source,
        hostname,
        value
      from attributed),

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
          else 'unknown' end AS "name",
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

  // Imported revenue is always kept, whether or not its session matches the filters.
  const filteredRevenueQuery = `
    filtered_sessions as (
      select session_id
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and event_type != ${EVENT_TYPE.performance}
      ${dateQuery}
      ${filterQuery}
      group by session_id
    ),
    filtered_revenue as (
      select session_id, revenue
      from website_revenue
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and upper(currency) = {currency:String}
        and (${isImportedRevenue('event_name')}
          or session_id in (select session_id from filtered_sessions))
    )
  `;

  if (type === 'country' || type === 'region') {
    // Left join: revenue whose session has no event row still counts, under an empty location.
    const revenueSessionQuery = `
      revenue_session as (
        select session_id, any(country) as country, any(region) as region
        from website_event
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and session_id in (select session_id from filtered_revenue)
        group by session_id
      )
    `;

    if (type === 'country') {
      return rawQuery<{ name: string; value: number }[]>(
        `
        with
        ${filteredRevenueQuery},
        ${revenueSessionQuery}
        select
          revenue_session.country as "name",
          sum(filtered_revenue.revenue) as "value"
        from filtered_revenue
        any left join revenue_session
          on revenue_session.session_id = filtered_revenue.session_id
        group by revenue_session.country
        order by value desc
        `,
        queryParams,
      );
    }

    return rawQuery<{ name: string; value: number; country: string }[]>(
      `
      with
      ${filteredRevenueQuery},
      ${revenueSessionQuery}
      select
        revenue_session.country as country,
        revenue_session.region as "name",
        sum(filtered_revenue.revenue) as "value"
      from filtered_revenue
      any left join revenue_session
        on revenue_session.session_id = filtered_revenue.session_id
      group by revenue_session.country, revenue_session.region
      order by value desc
      `,
      queryParams,
    );
  }

  // Revenue is credited to the session's first tracked event in the range, preferring an event
  // that matches the traffic-source filters so a filtered breakdown agrees with the filter.
  // Imported events are not visits, so a session with nothing else (tracked = 0) has no
  // referrer or channel.
  const attributedQuery = `
    session_revenue as (
      select session_id, sum(revenue) as value
      from filtered_revenue
      group by session_id
    ),
    first_event as (
      select
        session_id,
        argMin(
          tuple(referrer_domain, url_query, utm_medium, utm_source, hostname),
          tuple(if(${getAttributionMatch(filters, parseFilters)}, 0, 1), created_at)
        ) as first,
        1 as tracked
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {startDate:DateTime64} and {endDate:DateTime64}
        and session_id in (select session_id from session_revenue)
        and not ${isImportedRevenue('event_name')}
      group by session_id
    ),
    attributed as (
      select
        session_revenue.value as value,
        first_event.tracked as tracked,
        tupleElement(first_event.first, 1) as referrer_domain,
        tupleElement(first_event.first, 2) as url_query,
        tupleElement(first_event.first, 3) as utm_medium,
        tupleElement(first_event.first, 4) as utm_source,
        tupleElement(first_event.first, 5) as hostname
      from session_revenue
      any left join first_event
        on first_event.session_id = session_revenue.session_id
    )
  `;

  if (type === 'referrer') {
    return rawQuery<{ name: string; value: number }[]>(
      `
      with
      ${filteredRevenueQuery},
      ${attributedQuery}
      select
        referrer_domain as "name",
        sum(value) as "value"
      from attributed
      group by referrer_domain
      order by value desc
      `,
      queryParams,
    );
  }

  return rawQuery<{ name: string; value: number }[]>(
    `
    with
    ${filteredRevenueQuery},
    ${attributedQuery},
    channels as (
      select
        case when multiSearchAny(lower(utm_medium), ['cp', 'ppc', 'retargeting', 'paid']) != 0 then 'paid' else 'organic' end prefix,
        case
          when tracked = 0 then 'unknown'
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
        else 'unknown' end AS "name",
        value
      from attributed
    )

    select name, sum(value) value
    from channels
    group by name
    order by value desc
    `,
    queryParams,
  );
}

// Filters on a visit's traffic source. Other filters (path, event, location...) only select
// sessions and do not move the credit away from where the visit came from.
const ATTRIBUTION_FILTERS = [
  'referrer',
  'domain',
  'query',
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmContent',
  'utmTerm',
];

// SQL condition that is true for events matching the traffic-source filters (always true
// when there are none). Its placeholders reuse the params of the full filter set.
function getAttributionMatch(
  filters: QueryFilters,
  parseFilters: (filters: Record<string, any>) => { filterQuery: string },
) {
  const attributionFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([key]) => key === 'match' || ATTRIBUTION_FILTERS.includes(key.replace(/\d+$/, '')),
    ),
  );

  return `(1 = 1 ${parseFilters(attributionFilters).filterQuery})`;
}

function toClickHouseStringArray(arr: string[]): string {
  return arr.map(p => `'${p.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(', ');
}

function toPostgresLikeClause(column: string, arr: string[]) {
  return arr.map(val => `${column} ilike '%${val.replace(/'/g, "''")}%'`).join(' OR\n  ');
}
