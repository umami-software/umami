import clickhouse from '@/lib/clickhouse';
import { commerceStageSQL } from '@/lib/commerce-events';
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
 * - Only completed payments (an order ID) count as orders and revenue.
 * - One currency is reported at a time; amounts are never summed across currencies.
 * - ClickHouse parents and items are read with FINAL and joined on
 *   website_id, commerce_event_id and snapshot_id, so superseded or orphaned
 *   item snapshots are never aggregated.
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
  productId?: string;
  category?: string;
  compare?: string;
  windowHours?: number;
}

export type CommerceStage = 'cart' | 'checkout' | 'order';

export interface CommerceQueryOptions {
  /** Include cart and checkout events, not only completed payments. */
  allStages?: boolean;
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
  const { currency, market, productId, category } = parameters;

  return {
    commerceCurrency: currency?.toUpperCase(),
    commerceMarket: market,
    commerceProductId: productId,
    commerceCategory: category,
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
  const stage = commerceStageSQL('prisma', 'commerce_event');
  const { startDate, endDate, market, productId, category } = parameters;
  const { queryParams, filterQuery, cohortQuery, joinSessionQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });
  const isScoped = !!(productId || category);
  const isSessionFiltered = hasSql(filterQuery) || hasSql(cohortQuery);
  const itemScopeQuery = [
    productId && 'and commerce_item.product_id = {{commerceProductId}}',
    category && 'and commerce_item.category = {{commerceCategory}}',
  ]
    .filter(Boolean)
    .join('\n');

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
        commerce_event.cart_id,
        commerce_event.checkout_id,
        commerce_event.order_id,
        commerce_event.subtotal,
        commerce_event.shipping,
        commerce_event.tax,
        commerce_event.total,
        commerce_event.created_at,
        ${stage.sql} as stage,
        coalesce(order_items.units, 0) as units,
        coalesce(order_items.lines, 0) as lines,
        ${isScoped ? 'order_items.value' : 'commerce_event.total'} as value
      from commerce_event
      ${isScoped ? 'join' : 'left join'} (
        select
          commerce_item.commerce_event_id,
          sum(commerce_item.quantity) as units,
          count(*) as lines,
          sum(commerce_item.total) as value
        from commerce_item
        where commerce_item.website_id = {{websiteId::uuid}}
          and commerce_item.created_at between {{startDate}} and {{endDate}}
          ${itemScopeQuery}
        group by commerce_item.commerce_event_id
      ) order_items
        on order_items.commerce_event_id = commerce_event.commerce_event_id
      ${
        isSessionFiltered
          ? 'join filtered_sessions on filtered_sessions.session_id = commerce_event.session_id'
          : ''
      }
      where commerce_event.website_id = {{websiteId::uuid}}
        and commerce_event.created_at between {{startDate}} and {{endDate}}
        and commerce_event.currency = {{commerceCurrency}}
        ${options.allStages ? '' : 'and commerce_event.order_id is not null'}
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
      ...stage.params,
    },
    filterQuery,
    cohortQuery,
    joinSessionQuery,
    dateQuery,
    isScoped,
    isSessionFiltered,
    itemScopeQuery,
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
  const stage = commerceStageSQL('clickhouse', 'ce');
  const { startDate, endDate, market, productId, category } = parameters;
  const { queryParams, filterQuery, cohortQuery, dateQuery } = parseFilters({
    ...filters,
    websiteId,
    startDate,
    endDate,
  });
  const isScoped = !!(productId || category);
  const isSessionFiltered = hasSql(filterQuery) || hasSql(cohortQuery);
  const itemScopeQuery = [
    productId && 'and product_id = {commerceProductId:String}',
    category && 'and category = {commerceCategory:String}',
  ]
    .filter(Boolean)
    .join('\n');

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

  // Items are aggregated per (parent, snapshot) and joined to the current parent snapshot,
  // so superseded or orphaned snapshots never contribute.
  const ordersCte = `
    orders as (
      select
        ce.commerce_event_id as commerce_event_id,
        ce.snapshot_id as snapshot_id,
        ce.session_id as session_id,
        ce.visit_id as visit_id,
        ce.event_name as event_name,
        ce.market as market,
        ce.cart_id as cart_id,
        ce.checkout_id as checkout_id,
        ce.order_id as order_id,
        ce.subtotal as subtotal,
        ce.shipping as shipping,
        ce.tax as tax,
        ce.total as total,
        ce.created_at as created_at,
        ${stage.sql} as stage,
        order_items.units as units,
        order_items.lines as lines,
        ${isScoped ? 'order_items.value' : 'ce.total'} as value
      from (
        select *
        from commerce_event final
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          and currency = {commerceCurrency:String}
          ${options.allStages ? '' : "and order_id != ''"}
          ${market ? 'and market = {commerceMarket:String}' : ''}
          ${isSessionFiltered ? 'and session_id in (select session_id from filtered_sessions)' : ''}
      ) as ce
      ${isScoped ? 'inner join' : 'left join'} (
        select
          commerce_event_id,
          snapshot_id,
          sum(quantity) as units,
          count() as lines,
          sum(total) as value
        from commerce_item final
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          ${itemScopeQuery}
        group by commerce_event_id, snapshot_id
      ) as order_items
        on order_items.commerce_event_id = ce.commerce_event_id
       and order_items.snapshot_id = ce.snapshot_id
    )`;

  return {
    queryParams: {
      ...queryParams,
      websiteId,
      startDate,
      endDate,
      lookbackDate: getLookbackDate(startDate),
      ...getScopeParams(parameters),
      ...stage.params,
    },
    filterQuery,
    cohortQuery,
    dateQuery,
    isScoped,
    isSessionFiltered,
    itemScopeQuery,
    ctes: [isSessionFiltered && filteredSessionsCte, ordersCte].filter(Boolean).join(','),
    filteredSessionsCte,
  };
}

/** Current, non-superseded item rows of the selected orders (`order_lines`). Requires `orders`. */
export function getOrderLinesCte(dialect: 'prisma' | 'clickhouse', itemScopeQuery = '') {
  if (dialect === 'prisma') {
    return `
    order_lines as (
      select
        commerce_item.commerce_event_id,
        commerce_item.item_index,
        commerce_item.product_id,
        commerce_item.name,
        commerce_item.variant,
        commerce_item.category,
        commerce_item.price,
        commerce_item.quantity,
        commerce_item.total,
        orders.session_id,
        orders.created_at
      from commerce_item
      join orders on orders.commerce_event_id = commerce_item.commerce_event_id
      where commerce_item.website_id = {{websiteId::uuid}}
        and commerce_item.created_at between {{startDate}} and {{endDate}}
        ${itemScopeQuery}
    )`;
  }

  return `
    order_lines as (
      select
        ci.commerce_event_id as commerce_event_id,
        ci.item_index as item_index,
        ci.product_id as product_id,
        ci.name as name,
        ci.variant as variant,
        ci.category as category,
        ci.price as price,
        ci.quantity as quantity,
        ci.total as total,
        orders.session_id as session_id,
        orders.created_at as created_at
      from (
        select *
        from commerce_item final
        where website_id = {websiteId:UUID}
          and created_at between {startDate:DateTime64} and {endDate:DateTime64}
          ${itemScopeQuery}
      ) as ci
      inner join orders
        on orders.commerce_event_id = ci.commerce_event_id
       and orders.snapshot_id = ci.snapshot_id
    )`;
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
        coalesce(session_links.distinct_id, orders.session_id::text) as buyer_id
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
        if(session_links.distinct_id = '', toString(orders.session_id), session_links.distinct_id) as buyer_id
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
