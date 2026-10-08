import { v5 } from 'uuid';
import { z } from 'zod';

const identifier = z.string().trim().min(1).max(200);
// Decimal strings preserve source amounts without reconstructing discounted unit prices.
const money = z
  .union([
    z.number().finite().nonnegative().max(999_999_999_999).multipleOf(0.0001),
    z
      .string()
      .regex(/^(?:0|[1-9]\d{0,11})(?:\.\d{1,4})?$/)
      .refine(value => Number(value) <= 999_999_999_999),
  ])
  .transform(String);

/** Independent order/refund facts, never cart or product state. */
export const commerceSchema = z
  .object({
    type: z.enum(['order', 'refund']).default('order'),
    source: identifier.optional(),
    orderId: identifier,
    refundId: identifier.optional(),
    currency: z
      .string()
      .regex(/^[A-Za-z]{3}$/)
      .transform(value => value.toUpperCase()),
    total: money,
    market: identifier.optional(),
    customerId: identifier.optional(),
    // Supply a source revision timestamp to replace an older full order snapshot.
    // Omit for immutable facts. Refunds are always immutable.
    updatedAt: z.iso.datetime().optional(),
    subtotal: money.optional(),
    shipping: money.optional(),
    tax: money.optional(),
    items: z
      .array(
        z
          .object({
            lineId: identifier.optional(),
            productId: identifier,
            name: z.string().max(200).optional(),
            variant: z.string().max(200).optional(),
            category: z.string().max(200).optional(),
            price: money.optional(),
            total: money.optional(),
          })
          .strict(),
      )
      .max(200)
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.type === 'refund' && !data.refundId) {
      ctx.addIssue({ code: 'custom', path: ['refundId'], message: 'Refunds require a refundId.' });
    }
    if (data.type === 'order' && data.refundId) {
      ctx.addIssue({
        code: 'custom',
        path: ['refundId'],
        message: 'Only refunds have a refundId.',
      });
    }
    const ids = data.items?.flatMap(item => (item.lineId ? [item.lineId] : [])) || [];
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: 'custom',
        path: ['items'],
        message: 'Line IDs must be unique within a record.',
      });
    }
  });

export type CommerceData = z.infer<typeof commerceSchema>;

export const recordCommerceSchema = commerceSchema.safeExtend({
  occurredAt: z.iso.datetime().optional(),
});

export function getCommerceEventId(websiteId: string, data: CommerceData) {
  const identity =
    data.type === 'refund'
      ? ['umami:refund', websiteId, data.source || '', data.orderId, data.refundId]
      : data.source
        ? ['umami:order', websiteId, data.source, data.orderId]
        : ['umami:payment', websiteId, data.orderId];
  return v5(JSON.stringify(identity), v5.URL);
}

export class CommerceIdentityError extends Error {}
