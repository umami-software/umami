import { v4 } from 'uuid';
import { Prisma } from '@/generated/prisma/client';
import clickhouse from '@/lib/clickhouse';
import { type CommerceData, CommerceIdentityError, commerceSchema } from '@/lib/commerce';
import { CLICKHOUSE, PRISMA, runQuery } from '@/lib/db';
import prisma from '@/lib/prisma';

interface CommerceContext {
  eventId: string;
  eventName: string;
  createdAt: Date;
  websiteId: string;
  sessionId?: string;
  visitId?: string;
  data: CommerceData;
}

/** Stores full order facts and immutable refunds. Items never determine the order total. */
export async function saveCommerceEvent(context: CommerceContext, tx?: Prisma.TransactionClient) {
  const { websiteId, sessionId, visitId, eventId: id, eventName } = context;
  const commerce = commerceSchema.parse(context.data);
  const { currency, market, orderId, source, customerId, refundId, type: kind } = commerce;
  const updatedAt = commerce.updatedAt ? new Date(commerce.updatedAt) : new Date();
  const decimal = (value?: string) => (value === undefined ? null : new Prisma.Decimal(value));
  const canReplace = (existing: { updatedAt: Date; currency: string }) => {
    if (existing.currency !== currency)
      throw new CommerceIdentityError('An order or refund cannot change currency.');
    return kind === 'order' && !!commerce.updatedAt && updatedAt > existing.updatedAt;
  };
  const event = {
    id,
    websiteId,
    sessionId: sessionId ?? null,
    visitId: visitId ?? null,
    eventName,
    currency,
    kind,
    source: source ?? null,
    referenceId: refundId ?? null,
    customerId: customerId ?? null,
    market: market ?? null,
    orderId,
    subtotal: decimal(commerce.subtotal),
    shipping: decimal(commerce.shipping),
    tax: decimal(commerce.tax),
    total: new Prisma.Decimal(commerce.total),
    createdAt: context.createdAt,
    updatedAt,
  };
  const getItems = (createdAt: Date) =>
    (commerce.items || []).map((item, itemIndex) => ({
      commerceEventId: id,
      websiteId,
      itemIndex,
      lineId: item.lineId ?? null,
      productId: item.productId,
      name: item.name ?? null,
      variant: item.variant ?? null,
      category: item.category ?? null,
      price: decimal(item.price),
      // A source line total is authoritative. Missing monetary detail stays unknown.
      total: decimal(item.total),
      createdAt,
    }));
  const write = async (client: Prisma.TransactionClient) => {
    // Orders need no website event or browser session. Serialize by logical identity.
    await client.$executeRaw(
      Prisma.sql`select pg_advisory_xact_lock(hashtextextended(${id}::text, 0))`,
    );
    const existing = await client.commerceEvent.findUnique({ where: { id } });
    if (existing && !canReplace(existing)) return;
    const record = existing
      ? {
          ...event,
          createdAt: existing.createdAt,
          sessionId: existing.sessionId,
          visitId: existing.visitId,
        }
      : event;
    await client.commerceEvent.upsert({ where: { id }, create: record, update: record });
    await client.commerceItem.deleteMany({ where: { commerceEventId: id } });
    const items = getItems(record.createdAt);
    if (items.length) await client.commerceItem.createMany({ data: items });
  };
  if (tx) return write(tx);
  return runQuery({
    [PRISMA]: () => prisma.transaction(write),
    [CLICKHOUSE]: async () => {
      const [existing] = await clickhouse.rawQuery<any[]>(
        'select * from commerce_event final where website_id = {websiteId:UUID} and commerce_event_id = {id:UUID} limit 1',
        { websiteId, id },
      );
      if (
        existing &&
        !canReplace({
          currency: existing.currency,
          updatedAt: new Date(existing.updated_at),
        })
      )
        return;
      const createdAt = existing ? new Date(existing.created_at) : context.createdAt;
      const snapshotId = v4();
      const date = (value: Date) => value.toISOString().replace('T', ' ').replace('Z', '');
      const amount = (value: Prisma.Decimal | null) => value?.toFixed(4) ?? null;
      const items = getItems(createdAt);
      // An empty order is valid; ClickHouse must not receive an empty insert.
      if (items.length)
        await clickhouse.insert(
          'commerce_item',
          items.map(item => ({
            website_id: websiteId,
            commerce_event_id: id,
            snapshot_id: snapshotId,
            item_index: item.itemIndex,
            line_id: item.lineId ?? '',
            product_id: item.productId,
            name: item.name ?? '',
            variant: item.variant ?? '',
            category: item.category ?? '',
            price: amount(item.price),
            total: amount(item.total),
            created_at: date(createdAt),
          })),
        );
      // Publishing after the item snapshot prevents partially visible orders. The source
      // revision is the replacing version, so a late older delivery cannot win a race.
      await clickhouse.insert('commerce_event', [
        {
          website_id: websiteId,
          commerce_event_id: id,
          snapshot_id: snapshotId,
          session_id: existing ? existing.session_id : (sessionId ?? null),
          visit_id: existing ? existing.visit_id : (visitId ?? null),
          event_name: eventName,
          currency,
          kind,
          source: source ?? '',
          reference_id: refundId ?? '',
          customer_id: customerId ?? '',
          market: market ?? '',
          order_id: orderId,
          subtotal: amount(event.subtotal),
          shipping: amount(event.shipping),
          tax: amount(event.tax),
          total: event.total.toFixed(4),
          created_at: date(createdAt),
          updated_at: date(updatedAt),
        },
      ]);
    },
  });
}
