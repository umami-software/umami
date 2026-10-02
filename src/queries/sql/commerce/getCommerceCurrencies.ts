import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import type { QueryFilters } from '@/lib/types';
import { toNumbers } from './commerceQuery';

const FUNCTION_NAME = 'getCommerceCurrencies';

export interface CommerceCurrency {
  currency: string;
  /** Completed payments. */
  orders: number;
  /** Revenue from completed payments. */
  revenue: number;
  /** All commerce events, including carts and checkouts. */
  events: number;
}

/**
 * Currencies with any commerce activity in the range, most orders first. Unfiltered by
 * design: it decides whether the website has commerce data and which currency to show.
 */
export async function getCommerceCurrencies(
  ...args: [websiteId: string, filters: QueryFilters]
): Promise<CommerceCurrency[]> {
  const rows: CommerceCurrency[] = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });

  return (rows || []).map(row => toNumbers(row, ['orders', 'revenue', 'events']));
}

async function relationalQuery(websiteId: string, filters: QueryFilters) {
  const { startDate, endDate } = filters;

  return prisma.rawQuery(
    `
    select
      commerce_event.currency as "currency",
      count(*) filter (where commerce_event.order_id is not null) as "orders",
      coalesce(sum(commerce_event.total) filter (where commerce_event.order_id is not null), 0) as "revenue",
      count(*) as "events"
    from commerce_event
    where commerce_event.website_id = {{websiteId::uuid}}
      and commerce_event.created_at between {{startDate}} and {{endDate}}
    group by 1
    order by 2 desc, 4 desc, 1
    `,
    { websiteId, startDate, endDate },
    FUNCTION_NAME,
  );
}

async function clickhouseQuery(websiteId: string, filters: QueryFilters) {
  const { startDate, endDate } = filters;

  return clickhouse.rawQuery(
    `
    select
      currency,
      countIf(order_id != '') as orders,
      sumIf(total, order_id != '') as revenue,
      count() as events
    from commerce_event final
    where website_id = {websiteId:UUID}
      and created_at between {startDate:DateTime64} and {endDate:DateTime64}
    group by currency
    order by orders desc, events desc, currency
    `,
    { websiteId, startDate, endDate },
    FUNCTION_NAME,
  );
}
