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
  toNumber,
  toNumbers,
} from './commerceQuery';

const FUNCTION_NAME = 'getCommerceStats';

export interface CommerceStats {
  revenue: number | null;
  refundAmount: number | null;
  netRevenue: number | null;
  subtotal: number | null;
  tax: number | null;
  shipping: number | null;
  orders: number;
  buyers: number;
  visitors: number;
  visits: number;
  convertedVisits: number;
  averageOrderValue: number | null;
  conversionRate: number | null;
  revenuePerVisitor: number | null;
}

const NUMBER_FIELDS: (keyof CommerceStats)[] = [
  'revenue',
  'subtotal',
  'tax',
  'shipping',
  'orders',
  'buyers',
  'visitors',
  'visits',
  'convertedVisits',
];

export async function getCommerceStats(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<CommerceStats> {
  const [row, refundAmount] = await Promise.all([
    runQuery({
      [PRISMA]: () => relationalQuery(...args),
      [CLICKHOUSE]: () => clickhouseQuery(...args),
    }),
    getRefundAmount(...args),
  ]);

  const stats = deriveCommerceStats(row);
  stats.refundAmount = refundAmount;
  stats.netRevenue =
    refundAmount == null || stats.revenue == null ? null : stats.revenue - refundAmount;
  // Commerce market context does not attribute all website traffic to that scope.
  // Do not present a scoped numerator over an unscoped denominator as a conversion rate.
  if (args[1].market || toNumber(row?.linkedOrders) < stats.orders) {
    stats.conversionRate = null;
    stats.revenuePerVisitor = null;
  }
  return stats;
}

export function deriveCommerceStats(row: Record<string, unknown> = {}): CommerceStats {
  const stats = toNumbers(row as Record<string, number>, NUMBER_FIELDS as string[]);
  for (const key of ['revenue', 'subtotal', 'tax', 'shipping']) {
    if (row[key] === null) stats[key] = null;
  }
  const { revenue = 0, orders = 0, visits = 0, visitors = 0, convertedVisits = 0 } = stats;

  return {
    revenue,
    refundAmount: null,
    netRevenue: null,
    subtotal: stats.subtotal,
    tax: stats.tax,
    shipping: stats.shipping,
    orders,
    buyers: stats.buyers ?? 0,
    visitors,
    visits,
    convertedVisits,
    averageOrderValue: revenue == null ? null : divide(revenue, orders),
    conversionRate: divide(convertedVisits, visits),
    revenuePerVisitor: revenue == null ? null : divide(revenue, visitors),
  };
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = prisma;
  const { ctes, queryParams, cohortQuery, joinSessionQuery, dateQuery, isSessionFiltered } =
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
        ${isSessionFiltered ? 'and website_event.session_id in (select session_id from filtered_sessions)' : ''}
    )
    select
      case when count(orders.value) = count(*) then coalesce(sum(orders.value), 0) else NULL end as "revenue",
      case when count(orders.subtotal) = count(*) then coalesce(sum(orders.subtotal), 0) else NULL end as "subtotal",
      case when count(orders.tax) = count(*) then coalesce(sum(orders.tax), 0) else NULL end as "tax",
      case when count(orders.shipping) = count(*) then coalesce(sum(orders.shipping), 0) else NULL end as "shipping",
      count(orders.commerce_event_id) as "orders",
      count(orders.visit_id) as "linkedOrders",
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
  const { ctes, queryParams, cohortQuery, dateQuery, isSessionFiltered } =
    getClickhouseCommerceQuery(websiteId, parameters, filters);

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
        ${isSessionFiltered ? 'and session_id in (select session_id from filtered_sessions)' : ''}
    )
    select
      if(count(orders.value) = count(), sum(orders.value), NULL) as revenue,
      if(count(orders.subtotal) = count(), sum(orders.subtotal), NULL) as subtotal,
      if(count(orders.tax) = count(), sum(orders.tax), NULL) as tax,
      if(count(orders.shipping) = count(), sum(orders.shipping), NULL) as shipping,
      count() as orders,
      count(orders.visit_id) as linkedOrders,
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

/** Refunds belong to their own occurrence period, even when the sale was earlier. */
async function getRefundAmount(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
): Promise<number> {
  const query = async (dialect: 'prisma' | 'clickhouse') => {
    const { ctes, queryParams } = (
      dialect === 'prisma' ? getRelationalCommerceQuery : getClickhouseCommerceQuery
    )(websiteId, parameters, filters, { kind: 'refund' });
    const [row] = await (dialect === 'prisma' ? prisma : clickhouse).rawQuery(
      `with ${ctes} select coalesce(sum(value), 0) as amount from orders`,
      queryParams,
      'getCommerceRefundAmount',
    );
    return toNumber(row?.amount);
  };
  return runQuery({ [PRISMA]: () => query('prisma'), [CLICKHOUSE]: () => query('clickhouse') });
}
