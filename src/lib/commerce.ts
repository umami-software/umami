import { z } from 'zod';

const identifier = z.string().trim().min(1).max(200);
const money = z.number().finite().nonnegative().max(1_000_000).multipleOf(0.0001);

export const commerceSchema = z
  .object({
    currency: z
      .string()
      .regex(/^[A-Za-z]{3}$/)
      .transform(value => value.toUpperCase()),
    market: identifier.optional(),
    cartId: identifier.optional(),
    checkoutId: identifier.optional(),
    orderId: identifier.optional(),
    shipping: money.default(0),
    tax: money.default(0),
    items: z
      .array(
        z
          .object({
            productId: identifier,
            name: z.string().max(200).optional(),
            variant: z.string().max(200).optional(),
            category: z.string().max(200).optional(),
            // Net unit price after discounts, excluding shipping and tax.
            price: money,
            quantity: z.number().int().min(1).max(10_000),
          })
          .strict(),
      )
      .min(1)
      .max(200),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.orderId && (data.tax || data.shipping)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Tax and shipping require an orderId.',
      });
    }
  });

export type CommerceData = z.infer<typeof commerceSchema>;
