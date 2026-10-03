import { randomUUID } from 'node:crypto';
import { beforeAll, describe, expect, test, vi } from 'vitest';

vi.hoisted(() => {
  // Opt in only to an explicitly disposable test database. Never inherit application credentials.
  process.env.DATABASE_URL =
    process.env.COMMERCE_TEST_DATABASE_URL || 'postgresql://unused:unused@127.0.0.1:1/unused';
  delete process.env.DATABASE_REPLICA_URL;
  if (process.env.COMMERCE_TEST_CLICKHOUSE_URL)
    process.env.CLICKHOUSE_URL = process.env.COMMERCE_TEST_CLICKHOUSE_URL;
  else delete process.env.CLICKHOUSE_URL;
});

import { DEFAULT_COMMERCE_SETTINGS } from '@/lib/commerce-settings';
import prisma from '@/lib/prisma';
import { saveEvent } from '../events/saveEvent';
import { getCommerceAbandonedCheckouts, getCommerceCheckout } from './getCommerceCheckout';
import { getCommerceMarkets } from './getCommerceMarkets';
import { getCommerceProducts } from './getCommerceProducts';
import { getCommerceStats } from './getCommerceStats';

const websiteId = randomUUID(),
  sessionId = randomUUID(),
  visitId = randomUUID();
const base = new Date('2026-09-20T12:00:00Z');
const parameters = {
  startDate: new Date('2026-09-20T00:00:00Z'),
  endDate: new Date('2026-09-20T23:59:59Z'),
  currency: 'EUR',
};
const filters = { ...parameters, pageSize: 100 };
const item = (
  productId: string,
  price = 10,
  quantity = 1,
  category = 'clothing',
  variant = 'blue',
) => ({ productId, price, quantity, category, variant });
async function event(
  name: string,
  minute: number,
  items = [item('a')],
  extra: Record<string, unknown> = {},
  context: Record<string, unknown> = {},
) {
  await saveEvent({
    websiteId,
    sessionId,
    visitId,
    urlPath: '/',
    eventType: 2,
    eventName: name,
    createdAt: new Date(+base + minute * 60000),
    country: 'DE',
    ...context,
    eventData: { commerce: { currency: 'EUR', market: 'DE', items, ...extra } },
  });
}

describe.skipIf(!process.env.COMMERCE_TEST_DATABASE_URL)('commerce database acceptance', () => {
  beforeAll(async () => {
    const url = new URL(process.env.COMMERCE_TEST_DATABASE_URL || '');
    if (!['127.0.0.1', 'localhost'].includes(url.hostname))
      throw new Error('Use a disposable loopback database');
    if (
      process.env.COMMERCE_TEST_CLICKHOUSE_URL &&
      !['127.0.0.1', 'localhost'].includes(
        new URL(process.env.COMMERCE_TEST_CLICKHOUSE_URL).hostname,
      )
    )
      throw new Error('Use a disposable loopback ClickHouse database');
    await prisma.client.website.create({
      data: {
        id: websiteId,
        name: 'Commerce acceptance',
        commerceConfig: DEFAULT_COMMERCE_SETTINGS,
      },
    });
    await prisma.client.session.create({ data: { id: sessionId, websiteId, country: 'DE' } });
    await event('view_item', 0, [item('a'), item('b'), item('zero')]);
    await event('view_item', 1, [item('a')]);
    await event('add_to_cart', 2, [item('b')], { cartId: 'cart-one' });
    await event('add_to_cart', 3, [item('b')], { cartId: 'cart-one' });
    // A view and cart addition in different markets do not convert each other.
    await event('add_to_cart', 4, [item('a')], { market: 'FR', cartId: 'cart-fr' });
    await event('view_item', 5, [{ productId: 'uncategorized', price: 1, quantity: 1 } as any]);
    await event('view_item', 5, [item('no-sales')], { market: 'ES' });
    // Two checkout attempts in one session; only one completes.
    await event('begin_checkout', 6, [item('b')], {
      cartId: 'cart-one',
      checkoutId: 'checkout-abandoned',
    });
    await event('begin_checkout', 7, [item('b')], { checkoutId: 'checkout-completed' });
    const order = {
      orderId: 'order-three-lines',
      checkoutId: 'checkout-completed',
      tax: 3,
      shipping: 2,
    };
    await event('bought-online', 8, [item('a', 10, 2), item('b', 20), item('c', 30)], order);
    await event('bought-online', 8, [item('a', 10, 2), item('b', 20), item('c', 30)], order);
    await event('legacy-unmapped', 9);
    await event('begin_checkout', 10); // missing ID must not invent an attempt
    // Same product ID but different variant: no variant conversion.
    await event('view_item', 11, [item('variant', 5, 1, 'clothing', 'red')]);
    await event('add_to_cart', 12, [item('variant', 5, 1, 'clothing', 'green')], {
      cartId: 'variant-cart',
    });
  }, 30000);

  test('keeps zero-sale products and matches ordered product activity within a visit and market', async () => {
    const { data } = await getCommerceProducts(websiteId, parameters, filters);
    const a = data.find(row => row.productId === 'a');
    const b = data.find(row => row.productId === 'b');
    if (!a || !b) throw new Error('Expected product rows');
    expect(a).toMatchObject({
      views: 2,
      viewingVisits: 1,
      convertedCartVisits: 0,
      addToCartRate: 0,
      orders: 1,
      units: 2,
      revenue: 20,
    });
    expect(b).toMatchObject({
      additions: 2,
      convertedCartVisits: 1,
      addToCartRate: 1,
      orders: 1,
      revenue: 20,
    });
    expect(data.find(row => row.productId === 'zero')).toMatchObject({
      views: 1,
      orders: 0,
      revenue: 0,
    });
    expect(a.purchaseRate).toBe(1);
    expect(a.cartToPurchaseRate).toBe(0);
    expect(b.cartToPurchaseRate).toBe(1);
  });
  test('category and variant aggregation preserve matching semantics', async () => {
    const category = await getCommerceProducts(websiteId, parameters, filters, {
      groupBy: 'category',
    });
    expect(category.data.find(row => row.category === 'clothing')).toMatchObject({
      viewingVisits: 1,
      convertedCartVisits: 1,
      addToCartRate: 1,
    });
    const variant = await getCommerceProducts(websiteId, parameters, filters, {
      groupBy: 'variant',
    });
    expect(category.data.find(row => row.category === '')).toMatchObject({
      views: 1,
      viewingVisits: 1,
    });
    expect(
      variant.data.find(row => row.productId === 'variant' && row.variant === 'red'),
    ).toMatchObject({ addToCartRate: 0 });
  });
  test('supports the high views and low additions report', async () => {
    const result = await getCommerceProducts(websiteId, parameters, filters, {
      minViews: 2,
      maxCartRate: 0.05,
      sort: 'views',
    });
    expect(result.data.map(row => row.productId)).toEqual(['a']);
  });
  test('retains one order and correct AOV for three differently priced items and a retry', async () => {
    const stats = await getCommerceStats(websiteId, parameters, filters);
    expect(stats).toMatchObject({ orders: 1, units: 4, revenue: 75, averageOrderValue: 75 });
    const scoped = await getCommerceStats(websiteId, { ...parameters, market: 'DE' }, filters);
    expect(scoped.conversionRate).toBeNull();
    expect(scoped.revenuePerVisitor).toBeNull();
  });
  test('counts separate checkout attempts and exposes unmapped/missing identifiers', async () => {
    const checkout = await getCommerceCheckout(websiteId, parameters, filters);
    expect(checkout).toMatchObject({
      completedCheckouts: 1,
      abandonedCheckouts: 1,
      pendingCheckouts: 0,
      unlinkedEvents: 1,
      unclassifiedEvents: 1,
    });
    expect(checkout.stages[1].sessions).toBe(2);
    const abandoned = await getCommerceAbandonedCheckouts(websiteId, parameters, filters);
    expect(abandoned.data.some(row => row.checkoutId === 'checkout-abandoned')).toBe(true);
  });
  test('makes markets with no purchases discoverable', async () => {
    expect(await getCommerceMarkets(websiteId, parameters, filters)).toContainEqual({ name: 'ES' });
  });
  test('does not count a repeated old checkout as a newly started attempt', async () => {
    await event('begin_checkout', -60 * 72, [item('old')], { checkoutId: 'old-checkout' });
    await event('begin_checkout', 20, [item('old')], { checkoutId: 'old-checkout' });
    const result = await getCommerceCheckout(
      websiteId,
      { ...parameters, productId: 'old' },
      filters,
    );
    expect(result.stages[1].attempts).toBe(0);
  });
  test('expires attempts at their window and preserves the basket value at expiry', async () => {
    await event('begin_checkout', 60, [item('expired', 10)], { checkoutId: 'expired' });
    await event('begin_checkout', 60 + 48 * 60, [item('expired', 100)], { checkoutId: 'expired' });
    await event('purchase', 61 + 48 * 60, [item('expired', 100)], {
      checkoutId: 'expired',
      orderId: 'expired-order',
    });
    const result = await getCommerceCheckout(
      websiteId,
      { ...parameters, productId: 'expired', endDate: new Date('2026-09-24T00:00:00Z') },
      { ...filters, endDate: new Date('2026-09-24T00:00:00Z') },
    );
    expect(result).toMatchObject({
      completedCheckouts: 0,
      abandonedCheckouts: 1,
      abandonedCheckoutValue: 10,
    });
  });
  test('matches outcomes after the selected range and across sessions; recent attempts stay pending', async () => {
    const another = randomUUID();
    await prisma.client.session.create({ data: { id: another, websiteId } });
    await event('begin_checkout', 60 * 11 + 50, [item('boundary')], { checkoutId: 'boundary' });
    await event(
      'purchase',
      60 * 12 + 10,
      [item('boundary')],
      { checkoutId: 'boundary', orderId: 'boundary-order' },
      { sessionId: another, visitId: randomUUID() },
    );
    const boundary = await getCommerceCheckout(
      websiteId,
      { ...parameters, productId: 'boundary' },
      filters,
    );
    expect(boundary).toMatchObject({ completedCheckouts: 1, abandonedCheckouts: 0 });
    const filtered = await getCommerceCheckout(
      websiteId,
      { ...parameters, productId: 'boundary' },
      { ...filters, country: 'DE' },
    );
    expect(filtered.completedCheckouts).toBe(1);
    const noMatches = await getCommerceCheckout(websiteId, parameters, {
      ...filters,
      country: 'US',
    });
    expect(noMatches).toMatchObject({ completedCheckouts: 0, orders: 0, unclassifiedEvents: 0 });

    await event('begin_checkout', (Date.now() - +base) / 60000 - 5, [item('pending')], {
      checkoutId: 'pending',
    });
    const pending = await getCommerceCheckout(
      websiteId,
      { ...parameters, productId: 'pending', endDate: new Date() },
      { ...filters, endDate: new Date() },
    );
    expect(pending).toMatchObject({ pendingCheckouts: 1, abandonedCheckouts: 0 });
  });
});
