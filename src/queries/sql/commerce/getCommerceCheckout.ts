import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PageResult, QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  type CommerceStage,
  divide,
  getClickhouseCommerceQuery,
  getRelationalCommerceQuery,
  getSessionAttributesCte,
  toNumber,
  toNumbers,
} from './commerceQuery';

/*
 * Checkout stages are inferred from the identifiers each commerce event carries:
 * an orderId is a completed payment, a checkoutId (without an order) is checkout,
 * anything else (a cart ID, or no ID) is cart. A session counts toward every stage
 * up to the furthest one it reached, so sites that only send checkout and payment
 * events still produce a monotonic funnel.
 */

const FUNCTION_NAME = 'getCommerceCheckout';

export interface CommerceCheckoutStage {
  stage: CommerceStage;
  sessions: number;
  /** Share of sessions that reached the first stage. */
  rate: number;
  /** Share of the previous stage's sessions that reached this stage. */
  stepRate: number;
}

export interface CommerceCheckout {
  stages: CommerceCheckoutStage[];
  abandonedCarts: number;
  abandonedCartValue: number;
  abandonedCheckouts: number;
  abandonedCheckoutValue: number;
  orders: number;
  revenue: number;
  /** Median seconds from a session's first commerce event to its first payment. */
  medianSecondsToOrder: number;
  /** Median seconds from a session's first checkout to its first payment. */
  medianSecondsCheckoutToOrder: number;
}

export interface CommerceAbandonedCheckout {
  sessionId: string;
  stage: Exclude<CommerceStage, 'order'>;
  lastAt: string;
  cartId: string;
  checkoutId: string;
  eventName: string;
  lines: number;
  units: number;
  value: number;
  country: string;
  device: string;
}

export async function getCommerceCheckout(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<CommerceCheckout> {
  const row = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });

  return deriveCheckout(row || {});
}

export function deriveCheckout(row: Record<string, unknown>): CommerceCheckout {
  const counts = {
    cart: toNumber(row.cartSessions),
    checkout: toNumber(row.checkoutSessions),
    order: toNumber(row.orderSessions),
  };
  const order: CommerceStage[] = ['cart', 'checkout', 'order'];

  return {
    stages: order.map((stage, index) => ({
      stage,
      sessions: counts[stage],
      rate: divide(counts[stage], counts.cart),
      stepRate: index === 0 ? 1 : divide(counts[stage], counts[order[index - 1]]),
    })),
    abandonedCarts: toNumber(row.abandonedCarts),
    abandonedCartValue: toNumber(row.abandonedCartValue),
    abandonedCheckouts: toNumber(row.abandonedCheckouts),
    abandonedCheckoutValue: toNumber(row.abandonedCheckoutValue),
    orders: toNumber(row.orders),
    revenue: toNumber(row.revenue),
    medianSecondsToOrder: toNumber(row.medianSecondsToOrder),
    medianSecondsCheckoutToOrder: toNumber(row.medianSecondsCheckoutToOrder),
  };
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = prisma;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters, {
    allStages: true,
  });

  return rawQuery(
    `
    with ${ctes},
    ${getRelationalSessionStagesCte()}
    select
      count(*) as "cartSessions",
      sum(case when session_stages.reached in ('checkout', 'order') then 1 else 0 end) as "checkoutSessions",
      sum(case when session_stages.reached = 'order' then 1 else 0 end) as "orderSessions",
      sum(case when session_stages.reached = 'cart' then 1 else 0 end) as "abandonedCarts",
      coalesce(sum(case when session_stages.reached = 'cart' then session_stages.last_value end), 0) as "abandonedCartValue",
      sum(case when session_stages.reached = 'checkout' then 1 else 0 end) as "abandonedCheckouts",
      coalesce(sum(case when session_stages.reached = 'checkout' then session_stages.last_value end), 0) as "abandonedCheckoutValue",
      coalesce(sum(session_stages.orders), 0) as "orders",
      coalesce(sum(session_stages.revenue), 0) as "revenue",
      percentile_cont(0.5) within group (
        order by extract(epoch from (session_stages.first_order_at - session_stages.first_at))
      ) filter (where session_stages.first_order_at is not null) as "medianSecondsToOrder",
      percentile_cont(0.5) within group (
        order by extract(epoch from (session_stages.first_order_at - session_stages.first_checkout_at))
      ) filter (where session_stages.first_order_at is not null and session_stages.first_checkout_at is not null) as "medianSecondsCheckoutToOrder"
    from session_stages
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

function getRelationalSessionStagesCte() {
  return `
    last_events as (
      select distinct on (orders.session_id)
        orders.session_id,
        orders.commerce_event_id,
        orders.value
      from orders
      where orders.stage != 'order'
      order by orders.session_id, orders.created_at desc, orders.commerce_event_id
    ),
    session_stages as (
      select
        orders.session_id,
        case
          when max(case when orders.stage = 'order' then 1 else 0 end) = 1 then 'order'
          when max(case when orders.stage = 'checkout' then 1 else 0 end) = 1 then 'checkout'
          else 'cart'
        end as reached,
        min(orders.created_at) as first_at,
        min(case when orders.stage = 'checkout' then orders.created_at end) as first_checkout_at,
        min(case when orders.stage = 'order' then orders.created_at end) as first_order_at,
        max(orders.created_at) as last_at,
        sum(case when orders.stage = 'order' then 1 else 0 end) as orders,
        sum(case when orders.stage = 'order' then orders.value else 0 end) as revenue,
        max(last_events.value) as last_value,
        max(last_events.commerce_event_id::text) as last_event_id
      from orders
      left join last_events on last_events.session_id = orders.session_id
      group by orders.session_id
    )`;
}

async function clickhouseQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = clickhouse;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters, {
    allStages: true,
  });

  return rawQuery<Record<string, number>[]>(
    `
    with ${ctes},
    ${getClickhouseSessionStagesCte()}
    select
      count() as cartSessions,
      countIf(s.reached in ('checkout', 'order')) as checkoutSessions,
      countIf(s.reached = 'order') as orderSessions,
      countIf(s.reached = 'cart') as abandonedCarts,
      sumIf(s.last_value, s.reached = 'cart') as abandonedCartValue,
      countIf(s.reached = 'checkout') as abandonedCheckouts,
      sumIf(s.last_value, s.reached = 'checkout') as abandonedCheckoutValue,
      sum(s.order_count) as orders,
      sum(s.order_revenue) as revenue,
      quantileExactInclusiveIf(0.5)(
        toFloat64(dateDiff('millisecond', s.first_at, s.first_order_at)) / 1000,
        s.reached = 'order'
      ) as medianSecondsToOrder,
      quantileExactInclusiveIf(0.5)(
        toFloat64(dateDiff('millisecond', s.first_checkout_at, s.first_order_at)) / 1000,
        s.reached = 'order' and s.has_checkout = 1
      ) as medianSecondsCheckoutToOrder
    from session_stages as s
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

function getClickhouseSessionStagesCte() {
  return `
    session_stages as (
      select
        session_id,
        multiIf(countIf(stage = 'order') > 0, 'order', countIf(stage = 'checkout') > 0, 'checkout', 'cart') as reached,
        min(created_at) as first_at,
        minIf(created_at, stage = 'checkout') as first_checkout_at,
        countIf(stage = 'checkout') > 0 as has_checkout,
        minIf(created_at, stage = 'order') as first_order_at,
        max(created_at) as last_at,
        countIf(stage = 'order') as order_count,
        sumIf(value, stage = 'order') as order_revenue,
        argMaxIf(value, (created_at, commerce_event_id), stage != 'order') as last_value,
        argMaxIf(commerce_event_id, (created_at, commerce_event_id), stage != 'order') as last_event_id
      from orders
      group by session_id
    )`;
}

/** Sessions that reached cart or checkout but did not pay, most recent first. */
export async function getCommerceAbandonedCheckouts(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<PageResult<CommerceAbandonedCheckout[]>> {
  const result = await runQuery({
    [PRISMA]: () => relationalAbandonedQuery(...args),
    [CLICKHOUSE]: () => clickhouseAbandonedQuery(...args),
  });

  return {
    ...result,
    data: (result?.data || []).map((row: CommerceAbandonedCheckout) =>
      toNumbers(row, ['lines', 'units', 'value']),
    ),
  };
}

function getPageFilters(filters: QueryFilters) {
  return { ...filters, orderBy: undefined, sortDescending: undefined };
}

async function relationalAbandonedQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { pagedRawQuery } = prisma;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters, {
    allStages: true,
  });

  return pagedRawQuery(
    `
    with ${ctes},
    ${getRelationalSessionStagesCte()},
    ${getSessionAttributesCte('prisma')}
    select
      session_stages.session_id as "sessionId",
      session_stages.reached as "stage",
      session_stages.last_at as "lastAt",
      coalesce(orders.cart_id, '') as "cartId",
      coalesce(orders.checkout_id, '') as "checkoutId",
      orders.event_name as "eventName",
      orders.lines as "lines",
      orders.units as "units",
      orders.value as "value",
      coalesce(sa.country, '') as "country",
      coalesce(sa.device, '') as "device"
    from session_stages
    join orders on orders.commerce_event_id::text = session_stages.last_event_id
    left join session_attributes sa on sa.session_id = session_stages.session_id
    where session_stages.reached != 'order'
    order by session_stages.last_at desc, session_stages.session_id
    `,
    queryParams,
    getPageFilters(filters),
    `${FUNCTION_NAME}:abandoned`,
  );
}

async function clickhouseAbandonedQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { pagedRawQuery } = clickhouse;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters, {
    allStages: true,
  });

  return pagedRawQuery(
    `
    with ${ctes},
    ${getClickhouseSessionStagesCte()},
    ${getSessionAttributesCte('clickhouse')}
    select
      session_stages.session_id as sessionId,
      session_stages.reached as stage,
      session_stages.last_at as lastAt,
      orders.cart_id as cartId,
      orders.checkout_id as checkoutId,
      orders.event_name as eventName,
      orders.lines as lines,
      orders.units as units,
      orders.value as value,
      sa.country as country,
      sa.device as device
    from session_stages
    inner join orders on orders.commerce_event_id = session_stages.last_event_id
    left join session_attributes as sa on sa.session_id = session_stages.session_id
    where session_stages.reached != 'order'
    order by session_stages.last_at desc, session_stages.session_id
    `,
    queryParams,
    getPageFilters(filters),
    `${FUNCTION_NAME}:abandoned`,
  );
}
