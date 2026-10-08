import { z } from 'zod';
import { recordCommerceSchema } from '@/lib/commerce';

const money = z.object({ amount: z.string(), currencyCode: z.string() });
const moneyBag = z.object({ shopMoney: money });

/** Selected GraphQL Admin order fields; no checkout/cart or item-state input. */
export const shopifyCommerceSchema = z.object({
  shop: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/),
  order: z.object({
    id: z.string().min(1),
    processedAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    displayFinancialStatus: z.string(),
    test: z.boolean().default(false),
    totalPriceSet: moneyBag,
    customer: z.object({ id: z.string() }).nullish(),
    transactions: z
      .array(
        z.object({
          id: z.string(),
          kind: z.string(),
          status: z.string(),
          processedAt: z.iso.datetime().nullish(),
          amountSet: moneyBag,
        }),
      )
      .default([]),
  }),
});

/**
 * Imports authoritative shop-currency order totals and successful refund transactions.
 * Order totals are before returns, so refunds are not subtracted twice. Refund objects
 * alone are insufficient evidence that money was returned. Source documentation:
 * https://shopify.dev/docs/api/admin-graphql/latest/objects/Order
 * https://shopify.dev/docs/api/admin-graphql/latest/objects/Refund
 */
export function normalizeShopifyCommerce(input: z.infer<typeof shopifyCommerceSchema>) {
  const { shop, order } = shopifyCommerceSchema.parse(input);
  if (order.test) return [];
  const source = `shopify:${shop}`;
  const customerId = order.customer?.id;
  const records: z.infer<typeof recordCommerceSchema>[] = [];
  if (['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(order.displayFinancialStatus)) {
    const { amount, currencyCode } = order.totalPriceSet.shopMoney;
    records.push(
      recordCommerceSchema.parse({
        source,
        customerId,
        orderId: order.id,
        currency: currencyCode,
        total: amount,
        occurredAt: order.processedAt,
        updatedAt: order.updatedAt,
      }),
    );
  }
  for (const transaction of order.transactions) {
    if (transaction.kind !== 'REFUND' || transaction.status !== 'SUCCESS') continue;
    if (!transaction.processedAt)
      throw new Error('A successful Shopify refund needs its processedAt timestamp.');
    const { amount, currencyCode } = transaction.amountSet.shopMoney;
    records.push(
      recordCommerceSchema.parse({
        type: 'refund',
        source,
        customerId,
        orderId: order.id,
        refundId: transaction.id,
        currency: currencyCode,
        total: amount,
        occurredAt: transaction.processedAt,
      }),
    );
  }
  return records;
}
