import clickhouse from '@/lib/clickhouse';
import {
  COMMERCE_ATTRIBUTION_DIMENSIONS,
  COMMERCE_ATTRIBUTION_MODELS,
  type CommerceAttributionDimension,
  type CommerceAttributionModel,
} from '@/lib/commerce-reports';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import {
  COMMERCE_LOOKBACK_DAYS,
  type CommerceParameters,
  getChannelSQL,
  getClickhouseCommerceQuery,
  getDirectTouchSQL,
  getPaidAdsSQL,
  getRelationalCommerceQuery,
  getVisitEntriesCte,
  toNumber,
} from './commerceQuery';

/*
 * Revenue attribution. Every visit of the purchasing session that started before the
 * order (looking back COMMERCE_LOOKBACK_DAYS before the range) is a touch.
 *
 * first-click: the earliest touch.
 * last-click:  the latest touch with an external referrer, campaign or click ID
 *              (last non-direct click), or the latest touch when every touch is direct.
 *
 * Orders with no recorded touch are attributed as direct.
 */

const FUNCTION_NAME = 'getCommerceAttribution';
const ROW_LIMIT = 20;

export {
  COMMERCE_ATTRIBUTION_DIMENSIONS,
  COMMERCE_ATTRIBUTION_MODELS,
  type CommerceAttributionDimension,
  type CommerceAttributionModel,
};

export interface CommerceAttributionRow {
  name: string;
  revenue: number;
  orders: number;
}

export type CommerceAttribution = Record<CommerceAttributionDimension, CommerceAttributionRow[]> & {
  model: CommerceAttributionModel;
  lookbackDays: number;
  total: { revenue: number; orders: number };
};

export async function getCommerceAttribution(
  ...args: [
    websiteId: string,
    parameters: CommerceParameters,
    filters: QueryFilters,
    model: CommerceAttributionModel,
  ]
): Promise<CommerceAttribution> {
  const rows: { dimension: string; name: string; revenue: unknown; orders: unknown }[] =
    await runQuery({
      [PRISMA]: () => relationalQuery(...args),
      [CLICKHOUSE]: () => clickhouseQuery(...args),
    });

  return groupAttribution(rows || [], args[3]);
}

export function groupAttribution(
  rows: { dimension: string; name: string; revenue: unknown; orders: unknown }[],
  model: CommerceAttributionModel,
): CommerceAttribution {
  const result = Object.fromEntries(
    COMMERCE_ATTRIBUTION_DIMENSIONS.map(dimension => [dimension, [] as CommerceAttributionRow[]]),
  ) as Record<CommerceAttributionDimension, CommerceAttributionRow[]>;
  let total = { revenue: 0, orders: 0 };

  for (const row of rows) {
    const value = {
      name: row.name ?? '',
      revenue: toNumber(row.revenue),
      orders: toNumber(row.orders),
    };

    if (row.dimension === 'total') {
      total = { revenue: value.revenue, orders: value.orders };
    } else if (result[row.dimension as CommerceAttributionDimension]) {
      result[row.dimension as CommerceAttributionDimension].push(value);
    }
  }

  for (const dimension of COMMERCE_ATTRIBUTION_DIMENSIONS) {
    result[dimension] = result[dimension]
      .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders || a.name.localeCompare(b.name))
      .slice(0, ROW_LIMIT);
  }

  return { ...result, model, lookbackDays: COMMERCE_LOOKBACK_DAYS, total };
}

function getDimensionSelects(dialect: 'prisma' | 'clickhouse') {
  const referrer =
    dialect === 'prisma'
      ? `case when model.referrer_domain = regexp_replace(model.hostname, '^www.', '') then '' else model.referrer_domain end`
      : `if(model.referrer_domain = model.hostname, '', model.referrer_domain)`;

  return [
    ['channel', getChannelSQL(dialect, 'model'), false],
    ['referrer', referrer, true],
    ['paidAds', getPaidAdsSQL(dialect, 'model'), true],
    ['entry', 'model.url_path', true],
    ['utmSource', 'model.utm_source', true],
    ['utmMedium', 'model.utm_medium', true],
    ['utmCampaign', 'model.utm_campaign', true],
    ['utmContent', 'model.utm_content', true],
    ['utmTerm', 'model.utm_term', true],
  ] as const;
}

function getUnionQuery(dialect: 'prisma' | 'clickhouse') {
  const count = dialect === 'prisma' ? 'count(*)' : 'count()';
  const dimensions = getDimensionSelects(dialect).map(
    ([dimension, expression, excludeEmpty]) => `
      select '${dimension}' as dimension, name, sum(value) as revenue, ${count} as orders
      from (select ${expression} as name, model.value as value from model) as d
      ${excludeEmpty ? "where name != ''" : ''}
      group by name`,
  );

  return [
    ...dimensions,
    `
      select 'total' as dimension, '' as name, sum(orders.value) as revenue, ${count} as orders
      from orders`,
  ].join('\n      union all');
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  model: CommerceAttributionModel,
) {
  const { rawQuery } = prisma;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters);
  const rank = model === 'first-click' ? 'first_rank' : 'last_rank';
  const columns = [
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

  return rawQuery(
    `
    with ${ctes},
    ${getVisitEntriesCte('prisma', 'order_sessions')},
    touches as (
      select
        orders.commerce_event_id,
        orders.value,
        ${columns.map(column => `coalesce(ve.${column}, '') as ${column}`).join(',\n        ')},
        row_number() over (
          partition by orders.commerce_event_id
          order by ve.entry_at, ve.visit_id
        ) as first_rank,
        row_number() over (
          partition by orders.commerce_event_id
          order by case when ${getDirectTouchSQL('prisma', 've')} then 1 else 0 end, ve.entry_at desc, ve.visit_id
        ) as last_rank
      from orders
      left join visit_entries ve
        on ve.session_id = orders.session_id
       and ve.entry_at <= orders.created_at
    ),
    model as (
      select * from touches where ${rank} = 1
    )
    ${getUnionQuery('prisma')}
    `,
    queryParams,
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  model: CommerceAttributionModel,
) {
  const { rawQuery } = clickhouse;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters);
  const rank = model === 'first-click' ? 'first_rank' : 'last_rank';

  return rawQuery(
    `
    with ${ctes},
    ${getVisitEntriesCte('clickhouse', 'order_sessions')},
    order_touches as (
      select
        orders.commerce_event_id as commerce_event_id,
        orders.value as value,
        orders.created_at as order_at,
        ve.visit_id as visit_id,
        ve.entry_at as entry_at,
        ve.referrer_domain as referrer_domain,
        ve.url_query as url_query,
        ve.url_path as url_path,
        ve.hostname as hostname,
        ve.utm_source as utm_source,
        ve.utm_medium as utm_medium,
        ve.utm_campaign as utm_campaign,
        ve.utm_content as utm_content,
        ve.utm_term as utm_term,
        ve.gclid as gclid,
        ve.fbclid as fbclid,
        ve.msclkid as msclkid,
        ve.ttclid as ttclid,
        ve.li_fat_id as li_fat_id,
        ve.twclid as twclid
      from orders
      left join visit_entries as ve on ve.session_id = orders.session_id
    ),
    touches as (
      select
        t.*,
        row_number() over (
          partition by t.commerce_event_id
          order by t.entry_at, t.visit_id
        ) as first_rank,
        row_number() over (
          partition by t.commerce_event_id
          order by if(${getDirectTouchSQL('clickhouse', 't')}, 1, 0), t.entry_at desc, t.visit_id
        ) as last_rank
      from order_touches as t
      where t.entry_at <= t.order_at
    ),
    model as (
      select * from touches where ${rank} = 1
    )
    ${getUnionQuery('clickhouse')}
    `,
    queryParams,
    FUNCTION_NAME,
  );
}
