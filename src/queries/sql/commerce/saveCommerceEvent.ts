import { v4 } from 'uuid';
import { Prisma } from '@/generated/prisma/client';
import clickhouse from '@/lib/clickhouse';
import { type CommerceData, commerceSchema } from '@/lib/commerce';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

interface CommerceContext {
  eventId: string;
  eventName: string;
  createdAt: Date;
  websiteId: string;
  sessionId: string;
  visitId: string;
  data: CommerceData;
}

export async function saveCommerceEvent(context: CommerceContext, tx?: Prisma.TransactionClient) {
  const { websiteId, sessionId, visitId, eventId: id, eventName, createdAt } = context;
  const commerce = commerceSchema.parse(context.data);
  const { currency, market, cartId, checkoutId, orderId } = commerce;
  const updatedAt = new Date();
  const items = commerce.items.map((item, itemIndex) => ({
    commerceEventId: id,
    websiteId,
    itemIndex,
    productId: item.productId,
    name: item.name ?? null,
    variant: item.variant ?? null,
    category: item.category ?? null,
    price: new Prisma.Decimal(item.price),
    quantity: item.quantity,
    total: new Prisma.Decimal(item.price).mul(item.quantity),
    createdAt,
  }));
  const subtotal = items.reduce((sum, item) => sum.add(item.total), new Prisma.Decimal(0));
  const shipping = new Prisma.Decimal(commerce.shipping);
  const tax = new Prisma.Decimal(commerce.tax);
  const event = {
    id,
    websiteId,
    sessionId,
    visitId,
    eventName,
    currency,
    market: market ?? null,
    cartId: cartId ?? null,
    checkoutId: checkoutId ?? null,
    orderId: orderId ?? null,
    subtotal,
    shipping,
    tax,
    total: subtotal.add(shipping).add(tax),
    createdAt,
    updatedAt,
  };

  const write = async (tx: Prisma.TransactionClient) => {
    // Upsert locks the parent before replacing its items, including concurrent retries.
    await tx.commerceEvent.upsert({ where: { id }, create: event, update: event });
    await tx.commerceItem.deleteMany({ where: { commerceEventId: id } });
    await tx.commerceItem.createMany({ data: items });
  };
  if (tx) return write(tx);
  return runQuery({
    [PRISMA]: () => prisma.transaction(write),
    [CLICKHOUSE]: async () => {
      const snapshotId = v4();
      const date = (value: Date) => value.toISOString().replace('T', ' ').replace('Z', '');
      // Publish the parent only after the complete item snapshot is acknowledged.
      // Readers join commerce_event FINAL to commerce_item FINAL on website, ID and snapshot.
      await clickhouse.insert(
        'commerce_item',
        items.map(item => ({
          website_id: websiteId,
          commerce_event_id: id,
          snapshot_id: snapshotId,
          item_index: item.itemIndex,
          product_id: item.productId,
          name: item.name ?? '',
          variant: item.variant ?? '',
          category: item.category ?? '',
          price: item.price.toFixed(4),
          quantity: item.quantity,
          total: item.total.toFixed(4),
          created_at: date(createdAt),
        })),
      );
      await clickhouse.insert('commerce_event', [
        {
          website_id: websiteId,
          commerce_event_id: id,
          snapshot_id: snapshotId,
          session_id: sessionId,
          visit_id: visitId,
          event_name: eventName,
          currency,
          market: market ?? '',
          cart_id: cartId ?? '',
          checkout_id: checkoutId ?? '',
          order_id: orderId ?? '',
          subtotal: subtotal.toFixed(4),
          shipping: shipping.toFixed(4),
          tax: tax.toFixed(4),
          total: event.total.toFixed(4),
          created_at: date(createdAt),
          updated_at: date(updatedAt),
        },
      ]);
    },
  });
}
