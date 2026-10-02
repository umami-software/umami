import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PageResult, QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  getClickhouseCommerceQuery,
  getRelationalCommerceQuery,
  getSessionAttributesCte,
  toNumbers,
} from './commerceQuery';
import { requireClickhouseCommerceTables } from './commerceTables';

const FUNCTION_NAME = 'getCommerceOrders';

export interface CommerceOrder {
  id: string;
  orderId: string;
  eventName: string;
  market: string;
  currency: string;
  sessionId: string;
  visitId: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  lines: number;
  units: number;
  country: string;
  device: string;
  browser: string;
  os: string;
}

const NUMBER_FIELDS: (keyof CommerceOrder)[] = [
  'subtotal',
  'shipping',
  'tax',
  'total',
  'lines',
  'units',
];

export async function getCommerceOrders(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<PageResult<CommerceOrder[]>> {
  const result = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: async () => {
      await requireClickhouseCommerceTables();
      return clickhouseQuery(...args);
    },
  });

  return { ...result, data: (result?.data || []).map(row => toNumbers(row, NUMBER_FIELDS)) };
}

function getPageFilters(filters: QueryFilters) {
  // Ordering is fixed by the query; never append a caller-supplied ORDER BY.
  return { ...filters, orderBy: undefined, sortDescending: undefined };
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { pagedRawQuery } = prisma;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters);
  const { search } = filters;

  return pagedRawQuery(
    `
    with ${ctes}, ${getSessionAttributesCte('prisma')}
    select
      orders.commerce_event_id as "id",
      orders.order_id as "orderId",
      orders.event_name as "eventName",
      coalesce(orders.market, '') as "market",
      {{commerceCurrency}} as "currency",
      orders.session_id as "sessionId",
      orders.visit_id as "visitId",
      orders.created_at as "createdAt",
      orders.subtotal as "subtotal",
      orders.shipping as "shipping",
      orders.tax as "tax",
      orders.total as "total",
      orders.lines as "lines",
      orders.units as "units",
      coalesce(sa.country, '') as "country",
      coalesce(sa.device, '') as "device",
      coalesce(sa.browser, '') as "browser",
      coalesce(sa.os, '') as "os"
    from orders
    left join session_attributes sa on sa.session_id = orders.session_id
    ${search ? 'where orders.order_id ilike {{search}}' : ''}
    order by orders.created_at desc, orders.order_id
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
) {
  const { pagedRawQuery } = clickhouse;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters);
  const { search } = filters;

  return pagedRawQuery(
    `
    with ${ctes}, ${getSessionAttributesCte('clickhouse')}
    select
      orders.commerce_event_id as id,
      orders.order_id as orderId,
      orders.event_name as eventName,
      orders.market as market,
      {commerceCurrency:String} as currency,
      orders.session_id as sessionId,
      orders.visit_id as visitId,
      orders.created_at as createdAt,
      orders.subtotal as subtotal,
      orders.shipping as shipping,
      orders.tax as tax,
      orders.total as total,
      orders.lines as lines,
      orders.units as units,
      sa.country as country,
      sa.device as device,
      sa.browser as browser,
      sa.os as os
    from orders
    left join session_attributes as sa on sa.session_id = orders.session_id
    ${search ? 'where positionCaseInsensitive(orders.order_id, {search:String}) > 0' : ''}
    order by orders.created_at desc, orders.order_id
    `,
    { ...queryParams, search },
    getPageFilters(filters),
    FUNCTION_NAME,
  );
}
