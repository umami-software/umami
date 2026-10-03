import clickhouse from '@/lib/clickhouse';
import {
  COMMERCE_PRODUCT_SORTS,
  type CommerceProductGroup,
  type CommerceProductSort,
} from '@/lib/commerce-reports';
import type { CommerceSettings } from '@/lib/commerce-settings';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PageResult, QueryFilters } from '@/lib/types';
import { getCommerceSettings } from '@/queries/prisma/commerce';
import {
  type CommerceParameters,
  divide,
  getClickhouseCommerceQuery,
  getOrderLinesCte,
  getRelationalCommerceQuery,
  toNumbers,
} from './commerceQuery';

export {
  COMMERCE_PRODUCT_GROUPS,
  COMMERCE_PRODUCT_SORTS,
  type CommerceProductGroup,
  type CommerceProductSort,
} from '@/lib/commerce-reports';
export interface CommerceProduct {
  productId: string;
  variant: string;
  category: string;
  name: string;
  units: number;
  revenue: number;
  orders: number;
  averagePrice: number;
  views: number;
  additions: number;
  viewingVisits: number;
  addingVisits: number;
  convertedCartVisits: number;
  convertedPurchaseVisits: number;
  addToCartRate: number;
  purchaseRate: number;
  convertedOrderVisits: number;
  cartToPurchaseRate: number;
}
export interface CommerceProductOptions {
  groupBy?: CommerceProductGroup;
  sort?: CommerceProductSort;
  minViews?: number;
  maxCartRate?: number;
}

/** Product identity and market are matched before rolling up to categories or variants. */
export function getProductConversionQuery(
  dialect: 'prisma' | 'clickhouse',
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  options: CommerceProductOptions,
  settings: CommerceSettings,
) {
  const context = (dialect === 'prisma' ? getRelationalCommerceQuery : getClickhouseCommerceQuery)(
    websiteId,
    parameters,
    filters,
    { allStages: true, events: settings.events },
  );
  const { ctes, itemScopeQuery, queryParams } = context;
  const group = options.groupBy || 'product';
  const q = (name: string) => `"${name}"`;
  const param = (key: string, type = 'String') =>
    dialect === 'prisma' ? `{{${key}}}` : `{${key}:${type}}`;
  const distinct = (condition: string, value = 'commerce_event_id') =>
    `count(distinct case when ${condition} then ${value} end)`;
  const keys =
    group === 'category' ? 'category' : group === 'variant' ? 'product_id, variant' : 'product_id';
  const totalKeys =
    group === 'category'
      ? 'item_category'
      : group === 'variant'
        ? 'product_id, item_variant'
        : 'product_id';
  const selectKeys = ` ${group === 'category' ? "''" : 'product_id'} as "productId",
    ${group === 'variant' ? 'item_variant' : "''"} as variant,
    ${group === 'category' ? 'item_category' : 'max(item_category)'} as category`;
  const sort = COMMERCE_PRODUCT_SORTS.includes(options.sort) ? options.sort : 'revenue';
  const search = filters.search
    ? dialect === 'prisma'
      ? `(product_id ilike ${param('search')} or name ilike ${param('search')} or category ilike ${param('search')} or variant ilike ${param('search')})`
      : `(positionCaseInsensitive(product_id, ${param('search')}) > 0 or positionCaseInsensitive(name, ${param('search')}) > 0 or positionCaseInsensitive(category, ${param('search')}) > 0 or positionCaseInsensitive(variant, ${param('search')}) > 0)`
    : '1 = 1';
  // CASE defaults on timestamps are nullable on both databases, including ClickHouse aggregates.
  const seen = `min(case when stage = 'view' then created_at end)`;
  const converted = (stage: string) =>
    dialect === 'prisma'
      ? `max(case when stage = '${stage}' then created_at end) > ${seen}`
      : `maxOrNullIf(created_at, stage = '${stage}') > minOrNullIf(created_at, stage = 'view')`;
  const cartToPurchase =
    dialect === 'prisma'
      ? "max(case when stage = 'order' then created_at end) > min(case when stage = 'cart' then created_at end)"
      : "maxOrNullIf(created_at, stage = 'order') > minOrNullIf(created_at, stage = 'cart')";
  const viewAt = dialect === 'prisma' ? seen : "minOrNullIf(created_at, stage = 'view')";
  const viewVisit = `count(distinct case when viewed = 1 then visit_id end)`;
  const cartVisit = `count(distinct case when converted_cart = 1 then visit_id end)`;
  const purchaseVisit = `count(distinct case when converted_purchase = 1 then visit_id end)`;
  return {
    sql: `with ${ctes}, ${getOrderLinesCte(dialect, itemScopeQuery)},
    activity as (
      select l.*, o.visit_id, coalesce(o.market, '') as market, o.stage,
        coalesce(l.variant, '') as item_variant, coalesce(l.category, '') as item_category
      from order_lines l join orders o on o.commerce_event_id = l.commerce_event_id
      where ${search}
    ),
    product_visits as (
      select product_id, ${group === 'variant' ? 'item_variant' : "''"} as variant,
        ${group === 'category' ? 'item_category' : "''"} as category, visit_id, market,
        case when ${viewAt} is not null then 1 else 0 end as viewed,
        case when ${converted('cart')} then 1 else 0 end as converted_cart,
        case when ${converted('order')} then 1 else 0 end as converted_purchase,
        case when ${cartToPurchase} then 1 else 0 end as cart_purchase
      from activity
      group by product_id, ${group === 'variant' ? 'item_variant,' : ''} ${group === 'category' ? 'item_category,' : ''} visit_id, market
    ),
    conversions as (
      select ${keys}, ${viewVisit} as viewing_visits, ${cartVisit} as cart_visits, ${purchaseVisit} as purchase_visits,
        count(distinct case when cart_purchase = 1 then visit_id end) as order_visits
      from product_visits group by ${keys}
    ),
    totals as (
      select ${selectKeys}, max(coalesce(name, '')) as name,
        sum(case when stage = 'order' then quantity else 0 end) as units,
        sum(case when stage = 'order' then total else 0 end) as revenue,
        ${distinct("stage = 'order'")} as orders,
        ${distinct("stage = 'view'")} as views,
        ${distinct("stage = 'cart'")} as additions,
        ${distinct("stage = 'cart'", 'visit_id')} as "addingVisits"
      from activity group by ${totalKeys}
    )
    select totals.*, c.viewing_visits as "viewingVisits", c.cart_visits as "convertedCartVisits",
      c.purchase_visits as "convertedPurchaseVisits", c.order_visits as "convertedOrderVisits",
      coalesce(1.0 * c.order_visits / nullif(totals."addingVisits", 0), 0) as "cartToPurchaseRate",
      coalesce(1.0 * c.cart_visits / nullif(c.viewing_visits, 0), 0) as "addToCartRate",
      coalesce(1.0 * c.purchase_visits / nullif(c.viewing_visits, 0), 0) as "purchaseRate"
    from totals join conversions c on ${group === 'category' ? 'c.category = totals.category' : `c.product_id = totals."productId"${group === 'variant' ? ' and c.variant = totals.variant' : ''}`}
    where totals.views >= ${param('minViews', 'UInt64')}
      and coalesce(1.0 * c.cart_visits / nullif(c.viewing_visits, 0), 0) <= ${param('maxCartRate', 'Float64')}
    order by ${q(sort)} desc, "productId", variant, category
    `,
    params: {
      ...queryParams,
      minViews: options.minViews ?? 0,
      maxCartRate: options.maxCartRate ?? 1,
      search: dialect === 'prisma' ? `%${filters.search}%` : filters.search,
    },
  };
}

export async function getCommerceProducts(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  options: CommerceProductOptions = {},
): Promise<PageResult<CommerceProduct[]>> {
  const settings = await getCommerceSettings(websiteId);
  const query = async (dialect: 'prisma' | 'clickhouse') => {
    const { sql, params } = getProductConversionQuery(
      dialect,
      websiteId,
      parameters,
      filters,
      options,
      settings,
    );
    return (dialect === 'prisma' ? prisma : clickhouse).pagedRawQuery(
      sql,
      params,
      { ...filters, orderBy: undefined, sortDescending: undefined },
      'getCommerceProducts',
    );
  };
  const result = await runQuery({
    [PRISMA]: () => query('prisma'),
    [CLICKHOUSE]: () => query('clickhouse'),
  });
  return {
    ...result,
    data: (result?.data || []).map((row: CommerceProduct) => {
      const product = toNumbers(row, [
        'units',
        'revenue',
        'orders',
        'views',
        'additions',
        'viewingVisits',
        'addingVisits',
        'convertedCartVisits',
        'convertedPurchaseVisits',
        'addToCartRate',
        'purchaseRate',
        'convertedOrderVisits',
        'cartToPurchaseRate',
      ]);
      return { ...product, averagePrice: divide(product.revenue, product.units) };
    }),
  };
}
