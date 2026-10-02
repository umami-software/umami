import clickhouse from '@/lib/clickhouse';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';
import { toNumbers } from './commerceQuery';
import { requireClickhouseCommerceTables } from './commerceTables';

const FUNCTION_NAME = 'getCommerceOrder';

export interface CommerceOrderItem {
  index: number;
  productId: string;
  name: string;
  variant: string;
  category: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CommerceOrderDetail {
  id: string;
  eventName: string;
  currency: string;
  market: string;
  cartId: string;
  checkoutId: string;
  orderId: string;
  sessionId: string;
  visitId: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  items: CommerceOrderItem[];
}

/** One commerce record (payment, checkout or cart) with its current item snapshot. */
export async function getCommerceOrder(
  ...args: [websiteId: string, commerceEventId: string]
): Promise<CommerceOrderDetail | null> {
  const result = await runQuery({
    [PRISMA]: () => relationalQuery(...args),
    [CLICKHOUSE]: async () => {
      await requireClickhouseCommerceTables();
      return clickhouseQuery(...args);
    },
  });

  if (!result?.order) {
    return null;
  }

  return {
    ...toNumbers(result.order, ['subtotal', 'shipping', 'tax', 'total']),
    items: result.items.map((item: CommerceOrderItem) =>
      toNumbers(item, ['index', 'price', 'quantity', 'total']),
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
      coalesce(cart_id, '') as "cartId",
      coalesce(checkout_id, '') as "checkoutId",
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
      product_id as "productId",
      coalesce(name, '') as "name",
      coalesce(variant, '') as "variant",
      coalesce(category, '') as "category",
      price as "price",
      quantity as "quantity",
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
      cart_id as cartId,
      checkout_id as checkoutId,
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
      product_id as productId,
      name,
      variant,
      category,
      price,
      quantity,
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
