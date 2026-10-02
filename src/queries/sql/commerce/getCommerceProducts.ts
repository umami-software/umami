import clickhouse from '@/lib/clickhouse';
import {
  COMMERCE_PRODUCT_GROUPS,
  COMMERCE_PRODUCT_SORTS,
  type CommerceProductGroup,
  type CommerceProductSort,
} from '@/lib/commerce-reports';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PageResult, QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  divide,
  getClickhouseCommerceQuery,
  getOrderLinesCte,
  getRelationalCommerceQuery,
  toNumbers,
} from './commerceQuery';
import { requireClickhouseCommerceTables } from './commerceTables';

const FUNCTION_NAME = 'getCommerceProducts';

export {
  COMMERCE_PRODUCT_GROUPS,
  COMMERCE_PRODUCT_SORTS,
  type CommerceProductGroup,
  type CommerceProductSort,
};

export interface CommerceProduct {
  productId: string;
  variant: string;
  category: string;
  name: string;
  units: number;
  revenue: number;
  orders: number;
  averagePrice: number;
}

export interface CommerceProductOptions {
  groupBy?: CommerceProductGroup;
  sort?: CommerceProductSort;
}

export async function getCommerceProducts(
  ...args: [
    websiteId: string,
    parameters: CommerceParameters,
    filters: QueryFilters,
    options?: CommerceProductOptions,
  ]
): Promise<PageResult<CommerceProduct[]>> {
  const result = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: async () => {
      await requireClickhouseCommerceTables();
      return clickhouseQuery(...args);
    },
  });

  return {
    ...result,
    data: (result?.data || []).map((row: CommerceProduct) => {
      const product = toNumbers(row, ['units', 'revenue', 'orders']);

      return { ...product, averagePrice: divide(product.revenue, product.units) };
    }),
  };
}

function getGroupColumns(
  dialect: 'prisma' | 'clickhouse',
  groupBy: CommerceProductGroup = 'product',
) {
  const value = (column: string) =>
    dialect === 'prisma' ? `coalesce(order_lines.${column}, '')` : `order_lines.${column}`;
  const quote = (alias: string) => (dialect === 'prisma' ? `"${alias}"` : alias);

  const keys = {
    product: {
      productId: 'order_lines.product_id',
      variant: "''",
      category: `max(${value('category')})`,
    },
    variant: {
      productId: 'order_lines.product_id',
      variant: value('variant'),
      category: `max(${value('category')})`,
    },
    category: { productId: "''", variant: "''", category: value('category') },
  }[groupBy];

  const grouped = {
    product: 'order_lines.product_id',
    variant: `order_lines.product_id, ${value('variant')}`,
    category: value('category'),
  }[groupBy];

  return {
    select: `
      ${keys.productId} as ${quote('productId')},
      ${keys.variant} as ${quote('variant')},
      ${keys.category} as ${quote('category')},
      ${groupBy === 'category' ? "''" : `max(${value('name')})`} as ${quote('name')}`,
    groupBy: grouped,
  };
}

function getSortColumn(sort: CommerceProductSort = 'revenue') {
  return (COMMERCE_PRODUCT_SORTS as readonly string[]).includes(sort) ? sort : 'revenue';
}

function getPageFilters(filters: QueryFilters) {
  return { ...filters, orderBy: undefined, sortDescending: undefined };
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  options: CommerceProductOptions = {},
) {
  const { pagedRawQuery } = prisma;
  const { ctes, queryParams, itemScopeQuery } = getRelationalCommerceQuery(
    websiteId,
    parameters,
    filters,
  );
  const { search } = filters;
  const columns = getGroupColumns('prisma', options.groupBy);
  const sort = getSortColumn(options.sort);

  return pagedRawQuery(
    `
    with ${ctes}, ${getOrderLinesCte('prisma', itemScopeQuery)}
    select
      ${columns.select},
      sum(order_lines.quantity) as "units",
      sum(order_lines.total) as "revenue",
      count(distinct order_lines.commerce_event_id) as "orders"
    from order_lines
    ${
      search
        ? `where (order_lines.product_id ilike {{search}}
           or order_lines.name ilike {{search}}
           or order_lines.variant ilike {{search}}
           or order_lines.category ilike {{search}})`
        : ''
    }
    group by ${columns.groupBy}
    order by "${sort}" desc, 1, 2, 3
    `,
    { ...queryParams, search: search ? `%${search}%` : undefined },
    getPageFilters(filters),
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
  options: CommerceProductOptions = {},
) {
  const { pagedRawQuery } = clickhouse;
  const { ctes, queryParams, itemScopeQuery } = getClickhouseCommerceQuery(
    websiteId,
    parameters,
    filters,
  );
  const { search } = filters;
  const columns = getGroupColumns('clickhouse', options.groupBy);
  const sort = getSortColumn(options.sort);

  return pagedRawQuery(
    `
    with ${ctes}, ${getOrderLinesCte('clickhouse', itemScopeQuery)}
    select
      ${columns.select},
      sum(order_lines.quantity) as units,
      sum(order_lines.total) as revenue,
      uniqExact(order_lines.commerce_event_id) as orders
    from order_lines
    ${
      search
        ? `where (positionCaseInsensitive(order_lines.product_id, {search:String}) > 0
           or positionCaseInsensitive(order_lines.name, {search:String}) > 0
           or positionCaseInsensitive(order_lines.variant, {search:String}) > 0
           or positionCaseInsensitive(order_lines.category, {search:String}) > 0)`
        : ''
    }
    group by ${columns.groupBy}
    order by ${sort} desc, productId, variant, category
    `,
    { ...queryParams, search },
    getPageFilters(filters),
    FUNCTION_NAME,
  );
}
