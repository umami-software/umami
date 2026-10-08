import clickhouse from '@/lib/clickhouse';
import { COMMERCE_LOOKBACK_DAYS } from '@/lib/commerce-reports';
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
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';

/**
 * Shared read layer for commerce reports.
 *
 * Every commerce query builds on the CTEs defined here so the storage rules in
 * docs/commerce.md are applied in exactly one place:
 *
 * - Only order facts count as orders and sales; refunds are queried independently.
 * - One currency is reported at a time; amounts are never summed across currencies.
 * - ClickHouse orders are read with FINAL so retries and revisions count once.
 * - Order analytics use source totals and never aggregate optional item details.
 * - Website filters, segments and cohorts select sessions, as in the revenue report.
 */

export { COMMERCE_LOOKBACK_DAYS };

export interface CommerceParameters {
  startDate: Date;
  endDate: Date;
  unit?: string;
  timezone?: string;
  currency: string;
  market?: string;
  compare?: string;
}

export interface CommerceQueryOptions {
  kind?: 'order' | 'refund';
}

export function getLookbackDate(startDate: Date) {
  return new Date(+new Date(startDate) - COMMERCE_LOOKBACK_DAYS * 86_400_000);
}

export function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  const number = Number(typeof value === 'object' ? String(value) : value);

  return Number.isFinite(number) ? number : 0;
}

/** Optional detail is unknown when absent, rather than zero. */
export function toNullableNumbers<T extends Record<string, any>>(row: T, keys: (keyof T)[]): T {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      keys.includes(key) ? (value == null ? null : toNumber(value)) : value,
    ]),
  ) as T;
}

/** Converts bigint, Decimal and numeric-string columns returned by either database to numbers. */
export function toNumbers<T extends Record<string, any>>(row: T, keys: (keyof T)[]): T {
  if (!row) {
    return row;
  }

  const result = { ...row };

  for (const key of keys) {
    result[key] = toNumber(row[key]) as T[keyof T];
  }

  return result;
}

export function divide(numerator: number, denominator: number) {
  return denominator > 0 ? numerator / denominator : 0;
}

function hasSql(value?: string) {
  return !!value?.trim();
}

function getScopeParams(parameters: CommerceParameters) {
  const { currency, market } = parameters;

  return {
    commerceCurrency: currency?.toUpperCase(),
    commerceMarket: market,
  };
}

/** Builds the PostgreSQL CTEs shared by the commerce reports. */
export function getRelationalCommerceQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  options: CommerceQueryOptions = {},
) {
  const { parseFilters } = prisma;
  const { startDate, endDate, market } = parameters;
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });
  const isSessionFiltered = hasSql(filterQuery) || hasSql(cohortQuery);

  const filteredSessionsCte = `
    filtered_sessions as (
      select distinct website_event.session_id
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.event_type != ${EVENT_TYPE.performance}
        ${dateQuery}
        ${filterQuery}
    )`;

  const ordersCte = `
    orders as (
      select
        commerce_event.commerce_event_id,
        commerce_event.session_id,
        commerce_event.visit_id,
        commerce_event.event_name,
        commerce_event.market,
        commerce_event.source,
        commerce_event.customer_id,
        commerce_event.order_id,
        commerce_event.subtotal,
        commerce_event.shipping,
        commerce_event.tax,
        commerce_event.total,
        commerce_event.created_at,
        commerce_event.total as value
      from commerce_event
      ${
        isSessionFiltered
          ? 'join filtered_sessions on filtered_sessions.session_id = commerce_event.session_id'
          : ''
      }
      where commerce_event.website_id = {{websiteId::uuid}}
        and commerce_event.created_at between {{startDate}} and {{endDate}}
        and commerce_event.currency = {{commerceCurrency}}
        and commerce_event.kind = {{commerceKind}}
        and commerce_event.order_id is not null
        ${market ? 'and commerce_event.market = {{commerceMarket}}' : ''}
    )`;

  return {
    queryParams: {
      ...queryParams,
      websiteId,
      startDate,
      endDate,
      lookbackDate: getLookbackDate(startDate),
      ...getScopeParams(parameters),
      commerceKind: options.kind ?? 'order',
    },
    filterQuery,
    cohortQuery,
    joinSessionQuery,
    dateQuery,
    isSessionFiltered,
    /** `filtered_sessions` (when filters apply) followed by `orders`. */
    ctes: [isSessionFiltered && filteredSessionsCte, ordersCte].filter(Boolean).join(','),
    filteredSessionsCte,
  };
}

/** Builds the ClickHouse CTEs shared by the commerce reports. */
export function getClickhouseCommerceQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  options: CommerceQueryOptions = {},
) {
  const { parseFilters } = clickhouse;
  const { startDate, endDate, market } = parameters;
  const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });
  const isSessionFiltered = hasSql(filterQuery) || hasSql(cohortQuery);

  const filteredSessionsCte = `
    filtered_sessions as (
      select session_id
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and event_type != ${EVENT_TYPE.performance}
        ${dateQuery}
        ${filterQuery}
      group by session_id
    )`;

  const ordersCte = `
    orders as (
      select
        ce.commerce_event_id as commerce_event_id,
        ce.snapshot_id as snapshot_id,
        ce.session_id as session_id,
        ce.visit_id as visit_id,
        ce.event_name as event_name,
        ce.market as market,
        ce.source as source,
        ce.customer_id as customer_id,
        ce.order_id as order_id,
        ce.subtotal as subtotal,
        ce.shipping as shipping,
        ce.tax as tax,
        ce.total as total,
        ce.created_at as created_at,
        ce.total as value
      from (
        select *
        from commerce_event final
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and currency = {commerceCurrency:String}
          and kind = {commerceKind:String}
          and order_id != ''
          ${market ? 'and market = {commerceMarket:String}' : ''}
          ${isSessionFiltered ? 'and session_id in (select session_id from filtered_sessions)' : ''}
      ) as ce

    )`;

  return {
    queryParams: {
      ...queryParams,
      websiteId,
      startDate,
      endDate,
      lookbackDate: getLookbackDate(startDate),
      ...getScopeParams(parameters),
      commerceKind: options.kind ?? 'order',
    },
    filterQuery,
    cohortQuery,
    dateQuery,
    isSessionFiltered,
    ctes: [isSessionFiltered && filteredSessionsCte, ordersCte].filter(Boolean).join(','),
    filteredSessionsCte,
  };
}

/**
 * Resolves a buyer for each order: the visitor's distinct ID when it has been identified,
 * otherwise the session (`order_buyers`). Requires `orders`.
 */
export function getOrderBuyersCte(dialect: 'prisma' | 'clickhouse') {
  if (dialect === 'prisma') {
    return `
    order_buyers as (
      select
        orders.commerce_event_id,
        orders.session_id,
        session_links.distinct_id,
        case when orders.customer_id is not null then concat('commerce:', length(coalesce(orders.source, '')), ':', coalesce(orders.source, ''), ':', orders.customer_id) else coalesce(session_links.distinct_id, orders.session_id::text) end as buyer_id
      from orders
      left join (
        select session_link.session_id, min(session_link.distinct_id) as distinct_id
        from session_link
        where session_link.website_id = {{websiteId::uuid}}
          and session_link.session_id in (select session_id from orders)
        group by session_link.session_id
      ) session_links
        on session_links.session_id = orders.session_id
    )`;
  }

  return `
    order_buyers as (
      select
        orders.commerce_event_id as commerce_event_id,
        orders.session_id as session_id,
        session_links.distinct_id as distinct_id,
        if(orders.customer_id != '', concat('commerce:', toString(length(orders.source)), ':', orders.source, ':', orders.customer_id), if(session_links.distinct_id = '', toString(orders.session_id), session_links.distinct_id)) as buyer_id
      from orders
      left join (
        select session_id, min(distinct_id) as distinct_id
        from session_link
        where website_id = {websiteId:UUID}
          and session_id in (select session_id from orders)
        group by session_id
      ) as session_links
        on session_links.session_id = orders.session_id
    )`;
}

const ENTRY_EVENT_TYPES = `${EVENT_TYPE.pageView}, ${EVENT_TYPE.customEvent}`;

const ENTRY_COLUMNS = [
  'referrer_domain',
  'url_query',
  'url_path',
  'hostname',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'fbclid',
  'msclkid',
  'ttclid',
  'li_fat_id',
  'twclid',
];

/**
 * The first page view or event of every visit of the order sessions (`visit_entries`),
 * searched from the lookback date. Requires `orders`.
 */
export function getVisitEntriesCte(
  dialect: 'prisma' | 'clickhouse',
  scope: 'order_visits' | 'order_sessions' = 'order_visits',
) {
  if (dialect === 'prisma') {
    const scopeQuery =
      scope === 'order_visits'
        ? 'and website_event.visit_id in (select visit_id from orders)'
        : 'and website_event.session_id in (select session_id from orders)';

    return `
    visit_entries as (
      select distinct on (website_event.visit_id)
        website_event.visit_id,
        website_event.session_id,
        website_event.created_at as entry_at,
        ${ENTRY_COLUMNS.map(column => `coalesce(website_event.${column}, '') as ${column}`).join(',\n        ')}
      from website_event
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.created_at between {{lookbackDate}} and {{endDate}}
        and website_event.event_type in (${ENTRY_EVENT_TYPES})
        ${scopeQuery}
      order by website_event.visit_id, website_event.created_at, website_event.event_type
    )`;
  }

  const scopeQuery =
    scope === 'order_visits'
      ? 'and visit_id in (select visit_id from orders)'
      : 'and session_id in (select session_id from orders)';

  return `
    visit_entries as (
      select
        visit_id,
        session_id,
        min(created_at) as entry_at,
        ${ENTRY_COLUMNS.map(column => `argMin(${column}, (created_at, event_type)) as ${column}`).join(',\n        ')}
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {lookbackDate:DateTime64} and {endDate:DateTime64}
        and event_type in (${ENTRY_EVENT_TYPES})
        ${scopeQuery}
      group by visit_id, session_id
    )`;
}

/**
 * Session attributes of the order sessions (`session_attributes`). ClickHouse stores them on
 * every event; PostgreSQL reads the session table. Requires `orders`.
 */
export function getSessionAttributesCte(dialect: 'prisma' | 'clickhouse') {
  if (dialect === 'prisma') {
    return `
    session_attributes as (
      select
        session.session_id,
        session.country,
        session.region,
        session.city,
        session.device,
        session.browser,
        session.os,
        session.language
      from session
      where session.website_id = {{websiteId::uuid}}
        and session.session_id in (select session_id from orders)
    )`;
  }

  return `
    session_attributes as (
      select
        session_id,
        any(country) as country,
        any(region) as region,
        any(city) as city,
        any(device) as device,
        any(browser) as browser,
        any(os) as os,
        any(language) as language
      from website_event
      where website_id = {websiteId:UUID}
        and created_at between {lookbackDate:DateTime64} and {endDate:DateTime64}
        and session_id in (select session_id from orders)
      group by session_id
    )`;
}

function toClickHouseStringArray(values: string[]) {
  return values.map(value => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`).join(', ');
}

function toPostgresLikeClause(column: string, values: string[]) {
  return `(${values.map(value => `${column} ilike '%${value.replace(/'/g, "''")}%'`).join(' or ')})`;
}

/**
 * Classifies an acquisition touch into the same marketing channels as the revenue
 * and channel reports. `alias` is a relation exposing the visit entry columns.
 */
export function getChannelSQL(dialect: 'prisma' | 'clickhouse', alias: string) {
  const column = (name: string) => `${alias}.${name}`;

  if (dialect === 'prisma') {
    const medium = column('utm_medium');
    const prefix = `(case when ${toPostgresLikeClause(medium, ['cp', 'ppc', 'retargeting', 'paid'])} then 'paid' else 'organic' end)`;

    return `case
          when ${column('referrer_domain')} = '' and ${column('url_query')} = '' then 'direct'
          when ${toPostgresLikeClause(column('url_query'), PAID_AD_PARAMS)} then 'paidAds'
          when ${toPostgresLikeClause(medium, ['referral', 'app', 'link'])} then 'referral'
          when ${medium} ilike '%affiliate%' then 'affiliate'
          when ${medium} ilike '%sms%' or ${column('utm_source')} ilike '%sms%' then 'sms'
          when ${toPostgresLikeClause(column('referrer_domain'), LLM_DOMAINS)} then 'llm'
          when ${toPostgresLikeClause(column('referrer_domain'), SEARCH_DOMAINS)} or ${medium} ilike '%organic%' then concat(${prefix}, 'Search')
          when ${toPostgresLikeClause(column('referrer_domain'), SOCIAL_DOMAINS)} then concat(${prefix}, 'Social')
          when ${toPostgresLikeClause(column('referrer_domain'), EMAIL_DOMAINS)} or ${medium} ilike '%mail%' then 'email'
          when ${toPostgresLikeClause(column('referrer_domain'), SHOPPING_DOMAINS)} or ${medium} ilike '%shop%' then concat(${prefix}, 'Shopping')
          when ${toPostgresLikeClause(column('referrer_domain'), VIDEO_DOMAINS)} or ${medium} ilike '%video%' then concat(${prefix}, 'Video')
          when ${column('referrer_domain')} != regexp_replace(${column('hostname')}, '^www.', '') and ${column('referrer_domain')} != '' then 'referral'
          else 'Unknown'
        end`;
  }

  const medium = `lower(${column('utm_medium')})`;
  const referrer = `lower(${column('referrer_domain')})`;
  const prefix = `if(multiSearchAny(${medium}, ['cp', 'ppc', 'retargeting', 'paid']) != 0, 'paid', 'organic')`;

  return `multiIf(
          ${column('referrer_domain')} = '' and ${column('url_query')} = '', 'direct',
          multiSearchAny(lower(${column('url_query')}), [${toClickHouseStringArray(PAID_AD_PARAMS)}]) != 0, 'paidAds',
          multiSearchAny(${medium}, ['referral', 'app', 'link']) != 0, 'referral',
          position(${medium}, 'affiliate') > 0, 'affiliate',
          position(${medium}, 'sms') > 0 or position(lower(${column('utm_source')}), 'sms') > 0, 'sms',
          multiSearchAny(${referrer}, [${toClickHouseStringArray(LLM_DOMAINS)}]) != 0, 'llm',
          multiSearchAny(${referrer}, [${toClickHouseStringArray(SEARCH_DOMAINS)}]) != 0 or position(${medium}, 'organic') > 0, concat(${prefix}, 'Search'),
          multiSearchAny(${referrer}, [${toClickHouseStringArray(SOCIAL_DOMAINS)}]) != 0, concat(${prefix}, 'Social'),
          multiSearchAny(${referrer}, [${toClickHouseStringArray(EMAIL_DOMAINS)}]) != 0 or position(${medium}, 'mail') > 0, 'email',
          multiSearchAny(${referrer}, [${toClickHouseStringArray(SHOPPING_DOMAINS)}]) != 0 or position(${medium}, 'shop') > 0, concat(${prefix}, 'Shopping'),
          multiSearchAny(${referrer}, [${toClickHouseStringArray(VIDEO_DOMAINS)}]) != 0 or position(${medium}, 'video') > 0, concat(${prefix}, 'Video'),
          ${column('referrer_domain')} != ${column('hostname')} and ${column('referrer_domain')} != '', 'referral',
          'Unknown')`;
}

/** Names the ad platform of a touch from its click ID, or '' when it has none. */
export function getPaidAdsSQL(dialect: 'prisma' | 'clickhouse', alias: string) {
  const column = (name: string) => `${alias}.${name}`;

  if (dialect === 'prisma') {
    return `case
          when ${column('gclid')} != '' then 'Google Ads'
          when ${column('fbclid')} != '' then 'Facebook / Meta'
          when ${column('msclkid')} != '' then 'Microsoft Ads'
          when ${column('ttclid')} != '' then 'TikTok Ads'
          when ${column('li_fat_id')} != '' then 'LinkedIn Ads'
          when ${column('twclid')} != '' then 'Twitter Ads (X)'
          else ''
        end`;
  }

  return `multiIf(
          ${column('gclid')} != '', 'Google Ads',
          ${column('fbclid')} != '', 'Facebook / Meta',
          ${column('msclkid')} != '', 'Microsoft Ads',
          ${column('ttclid')} != '', 'TikTok Ads',
          ${column('li_fat_id')} != '', 'LinkedIn Ads',
          ${column('twclid')} != '', 'Twitter Ads (X)',
          '')`;
}

/** True when a touch carries no external referrer, campaign or click ID. */
export function getDirectTouchSQL(dialect: 'prisma' | 'clickhouse', alias: string) {
  const column = (name: string) => `${alias}.${name}`;
  const selfReferral =
    dialect === 'prisma'
      ? `${column('referrer_domain')} = regexp_replace(${column('hostname')}, '^www.', '')`
      : `${column('referrer_domain')} = ${column('hostname')}`;

  return `((${column('referrer_domain')} = '' or ${selfReferral})
          and ${column('utm_source')} = ''
          and ${column('utm_medium')} = ''
          and ${column('utm_campaign')} = ''
          and ${[
            column('gclid'),
            column('fbclid'),
            column('msclkid'),
            column('ttclid'),
            column('li_fat_id'),
            column('twclid'),
          ]
            .map(name => `${name} = ''`)
            .join(' and ')})`;
}
