import clickhouse from '@/lib/clickhouse';
import { EVENT_TYPE } from '@/lib/constants';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  divide,
  getClickhouseCommerceQuery,
  getOrderBuyersCte,
  getRelationalCommerceQuery,
  toNumbers,
} from './commerceQuery';

const FUNCTION_NAME = 'getCommerceStats';

export interface CommerceStats {
  revenue: number;
  subtotal: number;
  tax: number;
  shipping: number;
  orders: number;
  units: number;
  buyers: number;
  visitors: number;
  visits: number;
  convertedVisits: number;
  averageOrderValue: number;
  unitsPerOrder: number;
  conversionRate: number | null;
  revenuePerVisitor: number | null;
}

const NUMBER_FIELDS: (keyof CommerceStats)[] = [
  'revenue',
  'subtotal',
  'tax',
  'shipping',
  'orders',
  'units',
  'buyers',
  'visitors',
  'visits',
  'convertedVisits',
];

export async function getCommerceStats(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<CommerceStats> {
  const row = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });

  const stats = deriveCommerceStats(row);
  // Commerce market/product context does not attribute all website traffic to that scope.
  // Do not present a scoped numerator over an unscoped denominator as a conversion rate.
  if (args[1].market || args[1].productId || args[1].category) {
    stats.conversionRate = null;
    stats.revenuePerVisitor = null;
  }
  return stats;
}

export function deriveCommerceStats(row: Record<string, unknown> = {}): CommerceStats {
  const stats = toNumbers(row as Record<string, number>, NUMBER_FIELDS as string[]);
  const {
    revenue = 0,
    orders = 0,
    units = 0,
    visits = 0,
    visitors = 0,
    convertedVisits = 0,
  } = stats;

  return {
    revenue,
    subtotal: stats.subtotal ?? 0,
    tax: stats.tax ?? 0,
    shipping: stats.shipping ?? 0,
    orders,
    units,
    buyers: stats.buyers ?? 0,
    visitors,
    visits,
    convertedVisits,
    averageOrderValue: divide(revenue, orders),
    unitsPerOrder: divide(units, orders),
    conversionRate: divide(convertedVisits, visits),
    revenuePerVisitor: divide(revenue, visitors),
  };
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = prisma;
  const { ctes, queryParams, cohortQuery, joinSessionQuery, dateQuery, filterQuery } =
    getRelationalCommerceQuery(websiteId, parameters, filters);

  return rawQuery(
    `
    with ${ctes},
    ${getOrderBuyersCte('prisma')},
    traffic as (
      select
        count(distinct website_event.session_id) as visitors,
        count(distinct website_event.visit_id) as visits
      from website_event
      ${cohortQuery}
      ${joinSessionQuery}
      where website_event.website_id = {{websiteId::uuid}}
        and website_event.event_type != ${EVENT_TYPE.performance}
        ${dateQuery}
        ${filterQuery}
    )
    select
      coalesce(sum(orders.value), 0) as "revenue",
      coalesce(sum(orders.subtotal), 0) as "subtotal",
      coalesce(sum(orders.tax), 0) as "tax",
      coalesce(sum(orders.shipping), 0) as "shipping",
      count(orders.commerce_event_id) as "orders",
      coalesce(sum(orders.units), 0) as "units",
      count(distinct orders.visit_id) as "convertedVisits",
      (select count(distinct buyer_id) from order_buyers) as "buyers",
      (select visitors from traffic) as "visitors",
      (select visits from traffic) as "visits"
    from orders
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

async function clickhouseQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = clickhouse;
  const { ctes, queryParams, cohortQuery, dateQuery, filterQuery } = getClickhouseCommerceQuery(
    websiteId,
    parameters,
    filters,
  );

  return rawQuery<Record<string, number>[]>(
    `
    with ${ctes},
    ${getOrderBuyersCte('clickhouse')},
    traffic as (
      select
        uniqExact(session_id) as visitors,
        uniqExact(visit_id) as visits
      from website_event
      ${cohortQuery}
      where website_id = {websiteId:UUID}
        and event_type != ${EVENT_TYPE.performance}
        ${dateQuery}
        ${filterQuery}
    )
    select
      sum(orders.value) as revenue,
      sum(orders.subtotal) as subtotal,
      sum(orders.tax) as tax,
      sum(orders.shipping) as shipping,
      count() as orders,
      sum(orders.units) as units,
      uniqExact(orders.visit_id) as convertedVisits,
      (select uniqExact(buyer_id) from order_buyers) as buyers,
      (select visitors from traffic) as visitors,
      (select visits from traffic) as visits
    from orders
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}
