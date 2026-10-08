import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { toNullableNumbers } from './commerceQuery';

const FUNCTION_NAME = 'getCommerceOrder';

export interface CommerceOrderItem {
  index: number;
  lineId: string;
  productId: string;
  name: string;
  variant: string;
  category: string;
  price: number;
  total: number;
}

export interface CommerceOrderDetail {
  id: string;
  eventName: string;
  currency: string;
  market: string;
  source: string;
  customerId: string;
  orderId: string;
  sessionId: string;
  visitId: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  refunds: { refundId: string; total: number; createdAt: string }[];
  items: CommerceOrderItem[];
}

/** One order with its optional source line details. */
export async function getCommerceOrder(
  ...args: [websiteId: string, commerceEventId: string]
): Promise<CommerceOrderDetail | null> {
  const result = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: () => clickhouseQuery(...args),
  });

  if (!result?.order) {
    return null;
  }

  const refundQuery = async (dialect: 'prisma' | 'clickhouse') => {
    const param = (key: string, type = 'String') =>
      dialect === 'prisma' ? `{{${key}${type === 'UUID' ? '::uuid' : ''}}}` : `{${key}:${type}}`;
    const rows = await (dialect === 'prisma' ? prisma : clickhouse).rawQuery(
      `select reference_id as "refundId", total, created_at as "createdAt" from commerce_event ${dialect === 'clickhouse' ? 'final' : ''}
       where website_id = ${param('websiteId', 'UUID')} and kind = 'refund'
         and order_id = ${param('orderId')} and coalesce(source, '') = ${param('source')}
         and currency = ${param('currency')} order by created_at`,
      {
        websiteId: args[0],
        orderId: result.order.orderId,
        source: result.order.source,
        currency: result.order.currency,
      },
      'getCommerceOrder:refunds',
    );
    return rows.map(row => ({ ...row, total: Number(row.total) }));
  };
  const refunds = await runQuery({
    [PRISMA]: () => refundQuery('prisma'),
    [CLICKHOUSE]: () => refundQuery('clickhouse'),
  });
  return {
    refunds,
    ...toNullableNumbers(result.order, ['subtotal', 'shipping', 'tax', 'total']),
    items: result.items.map((item: CommerceOrderItem) =>
      toNullableNumbers(item, ['index', 'price', 'total']),
    ),
  };
}

async function relationalQuery(websiteId: string, commerceEventId: string) {
  const { rawQuery } = prisma;
  const params = { websiteId, commerceEventId };
  const [order] = await rawQuery(
    `
    select
      commerce_event_id as "id",
      event_name as "eventName",
      currency as "currency",
      coalesce(market, '') as "market",
      coalesce(source, '') as "source",
      coalesce(customer_id, '') as "customerId",
      coalesce(order_id, '') as "orderId",
      session_id as "sessionId",
      visit_id as "visitId",
      created_at as "createdAt",
      subtotal as "subtotal",
      shipping as "shipping",
      tax as "tax",
      total as "total"
    from commerce_event
    where website_id = {{websiteId::uuid}}
      and commerce_event_id = {{commerceEventId::uuid}}
      and kind = 'order'
    `,
    params,
    FUNCTION_NAME,
  );

  if (!order) {
    return null;
  }

  const items = await rawQuery(
    `
    select
      item_index as "index",
      coalesce(line_id, '') as "lineId",
      product_id as "productId",
      coalesce(name, '') as "name",
      coalesce(variant, '') as "variant",
      coalesce(category, '') as "category",
      price as "price",
      total as "total"
    from commerce_item
    where website_id = {{websiteId::uuid}}
      and commerce_event_id = {{commerceEventId::uuid}}
    order by item_index
    `,
    params,
    FUNCTION_NAME,
  );

  return { order, items };
}

async function clickhouseQuery(websiteId: string, commerceEventId: string) {
  const { rawQuery } = clickhouse;
  const params = { websiteId, commerceEventId };
  const [order] = await rawQuery<any[]>(
    `
    select
      commerce_event_id as id,
      snapshot_id as snapshotId,
      event_name as eventName,
      currency,
      market,
      source,
      customer_id as customerId,
      order_id as orderId,
      session_id as sessionId,
      visit_id as visitId,
      created_at as createdAt,
      subtotal,
      shipping,
      tax,
      total
    from commerce_event final
    where website_id = {websiteId:UUID}
      and commerce_event_id = {commerceEventId:UUID}
      and kind = 'order'
    `,
    params,
    FUNCTION_NAME,
  );

  if (!order) {
    return null;
  }

  const { snapshotId, ...rest } = order;
  const items = await rawQuery(
    `
    select
      item_index as index,
      line_id as lineId,
      product_id as productId,
      name,
      variant,
      category,
      price,
      total
    from commerce_item final
    where website_id = {websiteId:UUID}
      and commerce_event_id = {commerceEventId:UUID}
      and snapshot_id = {snapshotId:UUID}
    order by item_index
    `,
    { ...params, snapshotId },
    FUNCTION_NAME,
  );

  return { order: rest, items };
}
