import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  getClickhouseCommerceQuery,
  getOrderLinesCte,
  getRelationalCommerceQuery,
  toNumbers,
} from './commerceQuery';

const FUNCTION_NAME = 'getCommerceBaskets';
const PAIR_LIMIT = 20;

export interface CommerceBasketSize {
  size: string;
  orders: number;
  revenue: number;
}

export interface CommerceProductPair {
  productId: string;
  name: string;
  pairedProductId: string;
  pairedName: string;
  orders: number;
}

export interface CommerceBaskets {
  sizes: CommerceBasketSize[];
  pairs: CommerceProductPair[];
}

/**
 * Units per order (1, 2, 3, 4, 5+) and products bought in the same order. With a
 * productId the pairs are that product's companions; otherwise the most common pairs.
 */
export async function getCommerceBaskets(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<CommerceBaskets> {
  const result = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });

  return {
    sizes: (result?.sizes || []).map((row: CommerceBasketSize) =>
      toNumbers(row, ['orders', 'revenue']),
    ),
    pairs: (result?.pairs || []).map((row: CommerceProductPair) => toNumbers(row, ['orders'])),
  };
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = prisma;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters);
  // Whole baskets: lines are not narrowed to the selected product or category.
  const base = `with ${ctes}, ${getOrderLinesCte('prisma')},
    order_products as (
      select
        order_lines.commerce_event_id,
        order_lines.product_id,
        max(coalesce(order_lines.name, '')) as name
      from order_lines
      group by 1, 2
    )`;
  const pairCondition = parameters.productId
    ? 'a.product_id = {{commerceProductId}} and b.product_id != a.product_id'
    : 'a.product_id < b.product_id';

  const [sizes, pairs] = await Promise.all([
    rawQuery(
      `
      ${base},
      order_sizes as (
        select order_lines.commerce_event_id, sum(order_lines.quantity) as units
        from order_lines
        group by 1
      )
      select
        case when order_sizes.units >= 5 then '5+' else order_sizes.units::text end as "size",
        count(*) as "orders",
        sum(orders.total) as "revenue"
      from orders
      join order_sizes on order_sizes.commerce_event_id = orders.commerce_event_id
      group by 1
      order by 1
      `,
      queryParams,
      FUNCTION_NAME,
    ),
    rawQuery(
      `
      ${base}
      select
        a.product_id as "productId",
        max(a.name) as "name",
        b.product_id as "pairedProductId",
        max(b.name) as "pairedName",
        count(distinct a.commerce_event_id) as "orders"
      from order_products a
      join order_products b
        on b.commerce_event_id = a.commerce_event_id
       and ${pairCondition}
      group by a.product_id, b.product_id
      order by "orders" desc, 1, 3
      limit ${PAIR_LIMIT}
      `,
      queryParams,
      FUNCTION_NAME,
    ),
  ]);

  return { sizes, pairs };
}

async function clickhouseQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = clickhouse;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters);
  const base = `with ${ctes}, ${getOrderLinesCte('clickhouse')},
    order_products as (
      select
        commerce_event_id,
        product_id,
        max(name) as name
      from order_lines
      group by commerce_event_id, product_id
    )`;
  const pairCondition = parameters.productId
    ? 'a.product_id = {commerceProductId:String} and b.product_id != a.product_id'
    : 'a.product_id < b.product_id';

  const [sizes, pairs] = await Promise.all([
    rawQuery(
      `
      ${base},
      order_sizes as (
        select commerce_event_id, sum(quantity) as units
        from order_lines
        group by commerce_event_id
      )
      select
        if(order_sizes.units >= 5, '5+', toString(order_sizes.units)) as size,
        count() as orders,
        sum(orders.total) as revenue
      from orders
      inner join order_sizes on order_sizes.commerce_event_id = orders.commerce_event_id
      group by size
      order by size
      `,
      queryParams,
      FUNCTION_NAME,
    ),
    rawQuery(
      `
      ${base}
      select
        a.product_id as productId,
        max(a.name) as name,
        b.product_id as pairedProductId,
        max(b.name) as pairedName,
        uniqExact(a.commerce_event_id) as orders
      from order_products as a
      inner join order_products as b on b.commerce_event_id = a.commerce_event_id
      where ${pairCondition}
      group by a.product_id, b.product_id
      order by orders desc, productId, pairedProductId
      limit ${PAIR_LIMIT}
      `,
      queryParams,
      FUNCTION_NAME,
    ),
  ]);

  return { sizes, pairs };
}
