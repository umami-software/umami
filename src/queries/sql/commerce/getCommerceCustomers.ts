import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { PageResult, QueryFilters } from '@/lib/types';
import {
  type CommerceParameters,
  divide,
  getClickhouseCommerceQuery,
  getOrderBuyersCte,
  getRelationalCommerceQuery,
  toNullableNumbers,
  toNumber,
  toNumbers,
} from './commerceQuery';

/*
 * A buyer is the source customer, then an identified browser visitor or session.
 * A buyer is new when their first-ever completed order (any currency, unfiltered)
 * falls inside the selected range; otherwise they are returning.
 * Time to purchase is measured within the session of the buyer's first order in range.
 */

const FUNCTION_NAME = 'getCommerceCustomers';

export interface CommerceCustomers {
  buyers: number;
  newBuyers: number;
  returningBuyers: number;
  repeatBuyers: number;
  repeatRate: number;
  orders: number;
  revenue: number | null;
  revenuePerBuyer: number | null;
  ordersPerBuyer: number;
  newRevenue: number | null;
  returningRevenue: number | null;
  medianSecondsToFirstOrder: number | null;
  medianVisitsToFirstOrder: number | null;
}

export interface CommerceBuyer {
  buyerId: string;
  distinctId: string;
  sessionId: string | null;
  sessions: number;
  orders: number;
  revenue: number | null;
  firstOrderAt: string;
  lastOrderAt: string;
  isNew: boolean;
}

export async function getCommerceCustomers(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<CommerceCustomers> {
  const row = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });

  return deriveCustomers(row || {});
}

export function deriveCustomers(row: Record<string, unknown>): CommerceCustomers {
  const buyers = toNumber(row.buyers);
  const newBuyers = toNumber(row.newBuyers);
  const orders = toNumber(row.orders);
  const revenue = row.revenue === null ? null : toNumber(row.revenue);
  const newRevenue = row.newRevenue === null ? null : toNumber(row.newRevenue);
  const repeatBuyers = toNumber(row.repeatBuyers);

  return {
    buyers,
    newBuyers,
    returningBuyers: buyers - newBuyers,
    repeatBuyers,
    repeatRate: divide(repeatBuyers, buyers),
    orders,
    revenue,
    revenuePerBuyer: revenue == null ? null : divide(revenue, buyers),
    ordersPerBuyer: divide(orders, buyers),
    newRevenue,
    returningRevenue: revenue == null || newRevenue == null ? null : revenue - newRevenue,
    medianSecondsToFirstOrder:
      row.medianSecondsToFirstOrder == null ? null : toNumber(row.medianSecondsToFirstOrder),
    medianVisitsToFirstOrder:
      row.medianVisitsToFirstOrder == null ? null : toNumber(row.medianVisitsToFirstOrder),
  };
}

function getRelationalBuyerCtes() {
  return `
    ${getOrderBuyersCte('prisma')},
    buyer_history as (
      select
        case when history.customer_id is not null then concat('commerce:', length(coalesce(history.source, '')), ':', coalesce(history.source, ''), ':', history.customer_id) else coalesce(history_links.distinct_id, history.session_id::text) end as buyer_id,
        min(history.created_at) as first_order_at
      from commerce_event history
      left join (
        select session_link.session_id, min(session_link.distinct_id) as distinct_id
        from session_link
        where session_link.website_id = {{websiteId::uuid}}
          and session_link.session_id in (
            select commerce_event.session_id
            from commerce_event
            where commerce_event.website_id = {{websiteId::uuid}}
              and commerce_event.order_id is not null and commerce_event.kind = 'order'
              and commerce_event.created_at <= {{endDate}}
          )
        group by session_link.session_id
      ) history_links
        on history_links.session_id = history.session_id
      where history.website_id = {{websiteId::uuid}}
        and history.order_id is not null and history.kind = 'order'
        and history.created_at <= {{endDate}}
      group by 1
    ),
    buyer_stats as (
      select
        order_buyers.buyer_id,
        max(order_buyers.distinct_id) as distinct_id,
        count(*) as orders,
        case when count(orders.value) = count(*) then sum(orders.value) end as revenue,
        count(distinct orders.session_id) as sessions,
        min(orders.created_at) as first_at,
        max(orders.created_at) as last_at,
        (array_agg(orders.session_id::text order by orders.created_at desc))[1] as last_session_id,
        (array_agg(orders.session_id::text order by orders.created_at))[1] as first_session_id
      from orders
      join order_buyers on order_buyers.commerce_event_id = orders.commerce_event_id
      where order_buyers.buyer_id is not null
      group by order_buyers.buyer_id
    ),
    buyers as (
      select
        buyer_stats.*,
        case when buyer_history.first_order_at >= {{startDate}} then 1 else 0 end as is_new
      from buyer_stats
      join buyer_history on buyer_history.buyer_id = buyer_stats.buyer_id
    )`;
}

async function relationalQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = prisma;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters);

  return rawQuery(
    `
    with ${ctes},
    ${getRelationalBuyerCtes()},
    first_purchase as (
      select
        buyers.buyer_id,
        extract(epoch from (buyers.first_at - min(website_event.created_at))) as seconds,
        count(distinct website_event.visit_id) as visits
      from buyers
      join website_event
        on website_event.website_id = {{websiteId::uuid}}
       and website_event.session_id = buyers.first_session_id::uuid
       and website_event.created_at between {{lookbackDate}} and buyers.first_at
      where buyers.is_new = 1
      group by buyers.buyer_id, buyers.first_at
    )
    select
      count(*) as "buyers",
      coalesce(sum(buyers.is_new), 0) as "newBuyers",
      coalesce(sum(case when buyers.orders > 1 then 1 else 0 end), 0) as "repeatBuyers",
      coalesce(sum(buyers.orders), 0) as "orders",
      case when count(buyers.revenue) = count(*) then coalesce(sum(buyers.revenue), 0) end as "revenue",
      case when count(case when buyers.is_new = 1 and buyers.revenue is null then 1 end) = 0 then coalesce(sum(case when buyers.is_new = 1 then buyers.revenue else 0 end), 0) end as "newRevenue",
      (select percentile_cont(0.5) within group (order by seconds) from first_purchase) as "medianSecondsToFirstOrder",
      (select percentile_cont(0.5) within group (order by visits) from first_purchase) as "medianVisitsToFirstOrder"
    from buyers
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

function getClickhouseBuyerCtes() {
  return `
    ${getOrderBuyersCte('clickhouse')},
    buyer_history as (
      select
        if(history.customer_id != '', concat('commerce:', toString(length(history.source)), ':', history.source, ':', history.customer_id), if(history_links.distinct_id = '', toString(history.session_id), history_links.distinct_id)) as buyer_id,
        min(history.created_at) as first_order_at
      from (
        select session_id, created_at, source, customer_id
        from commerce_event final
        where website_id = {websiteId:UUID}
          and order_id != '' and kind = 'order'
          and created_at <= {endDate:DateTime64}
      ) as history
      left join (
        select session_id, min(distinct_id) as distinct_id
        from session_link
        where website_id = {websiteId:UUID}
          and session_id in (
            select session_id
            from commerce_event final
            where website_id = {websiteId:UUID}
              and order_id != '' and kind = 'order'
              and created_at <= {endDate:DateTime64}
          )
        group by session_id
      ) as history_links
        on history_links.session_id = history.session_id
      group by buyer_id
    ),
    buyer_stats as (
      select
        order_buyers.buyer_id as buyer_id,
        max(order_buyers.distinct_id) as distinct_id,
        count() as order_count,
        if(count(orders.value) = count(), sum(orders.value), NULL) as buyer_revenue,
        uniqExact(orders.session_id) as sessions,
        min(orders.created_at) as first_at,
        max(orders.created_at) as last_at,
        toString(argMax(orders.session_id, orders.created_at)) as last_session_id,
        argMin(orders.session_id, orders.created_at) as first_session_id
      from orders
      inner join order_buyers on order_buyers.commerce_event_id = orders.commerce_event_id
      where order_buyers.buyer_id is not null
      group by order_buyers.buyer_id
    ),
    buyers as (
      select
        buyer_stats.*,
        if(buyer_history.first_order_at >= {startDate:DateTime64}, 1, 0) as is_new
      from buyer_stats
      inner join buyer_history on buyer_history.buyer_id = buyer_stats.buyer_id
    )`;
}

async function clickhouseQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { rawQuery } = clickhouse;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters);

  return rawQuery<Record<string, number>[]>(
    `
    with ${ctes},
    ${getClickhouseBuyerCtes()},
    first_purchase as (
      select
        b.buyer_id as buyer_id,
        toFloat64(dateDiff('millisecond', min(we.created_at), any(b.first_at))) / 1000 as seconds,
        uniqExact(we.visit_id) as visits
      from (select * from buyers where is_new = 1) as b
      inner join (
        select session_id, visit_id, created_at
        from website_event
        where website_id = {websiteId:UUID}
          and created_at between {lookbackDate:DateTime64} and {endDate:DateTime64}
          and session_id in (select first_session_id from buyers where is_new = 1)
      ) as we
        on we.session_id = b.first_session_id
      where we.created_at <= b.first_at
      group by b.buyer_id
    )
    select
      count() as buyers,
      sum(b.is_new) as newBuyers,
      countIf(b.order_count > 1) as repeatBuyers,
      sum(b.order_count) as orders,
      if(count(b.buyer_revenue) = count(), sum(b.buyer_revenue), NULL) as revenue,
      if(countIf(b.is_new = 1 and isNull(b.buyer_revenue)) = 0, sumIf(b.buyer_revenue, b.is_new = 1), NULL) as newRevenue,
      any(fp.median_seconds) as medianSecondsToFirstOrder,
      any(fp.median_visits) as medianVisitsToFirstOrder
    from buyers as b
    cross join (
      select
        if(count() > 0, quantileExactInclusive(0.5)(first_purchase.seconds), NULL) as median_seconds,
        if(count() > 0, quantileExactInclusive(0.5)(first_purchase.visits), NULL) as median_visits
      from first_purchase
    ) as fp
    `,
    queryParams,
    FUNCTION_NAME,
  ).then(result => result?.[0]);
}

/** Buyers in the range with their orders and revenue, highest revenue first. */
export async function getCommerceBuyers(
  ...args: [websiteId: string, parameters: CommerceParameters, filters: QueryFilters]
): Promise<PageResult<CommerceBuyer[]>> {
  const result = await runQuery({
    [PRISMA]: () => relationalBuyersQuery(...args),
    [CLICKHOUSE]: () => clickhouseBuyersQuery(...args),
  });

  return {
    ...result,
    data: (result?.data || []).map((row: any) => ({
      ...toNullableNumbers(toNumbers(row, ['sessions', 'orders']), ['revenue']),
      distinctId: row.distinctId ?? '',
      isNew: toNumber(row.isNew) === 1,
    })),
  };
}

function getPageFilters(filters: QueryFilters) {
  return { ...filters, orderBy: undefined, sortDescending: undefined };
}

async function relationalBuyersQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { pagedRawQuery } = prisma;
  const { ctes, queryParams } = getRelationalCommerceQuery(websiteId, parameters, filters);
  const { search } = filters;

  return pagedRawQuery(
    `
    with ${ctes},
    ${getRelationalBuyerCtes()}
    select
      buyers.buyer_id as "buyerId",
      coalesce(buyers.distinct_id, '') as "distinctId",
      buyers.last_session_id as "sessionId",
      buyers.sessions as "sessions",
      buyers.orders as "orders",
      buyers.revenue as "revenue",
      buyers.first_at as "firstOrderAt",
      buyers.last_at as "lastOrderAt",
      buyers.is_new as "isNew"
    from buyers
    ${search ? 'where buyers.buyer_id ilike {{search}}' : ''}
    order by buyers.revenue desc, buyers.buyer_id
    `,
    { ...queryParams, search: search ? `%${search}%` : undefined },
    getPageFilters(filters),
    `${FUNCTION_NAME}:buyers`,
  );
}

async function clickhouseBuyersQuery(
  websiteId: string,
  parameters: CommerceParameters,
  filters: QueryFilters,
) {
  const { pagedRawQuery } = clickhouse;
  const { ctes, queryParams } = getClickhouseCommerceQuery(websiteId, parameters, filters);
  const { search } = filters;

  return pagedRawQuery(
    `
    with ${ctes},
    ${getClickhouseBuyerCtes()}
    select
      b.buyer_id as buyerId,
      b.distinct_id as distinctId,
      b.last_session_id as sessionId,
      b.sessions as sessions,
      b.order_count as orders,
      b.buyer_revenue as revenue,
      b.first_at as firstOrderAt,
      b.last_at as lastOrderAt,
      b.is_new as isNew
    from buyers as b
    ${search ? 'where positionCaseInsensitive(b.buyer_id, {search:String}) > 0' : ''}
    order by b.buyer_revenue desc, b.buyer_id
    `,
    { ...queryParams, search },
    getPageFilters(filters),
    `${FUNCTION_NAME}:buyers`,
  );
}
