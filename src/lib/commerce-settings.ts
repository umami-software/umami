import { z } from 'zod';

const eventNames = z.array(z.string().trim().min(1).max(50)).max(20);
export const commerceSettingsSchema = z
  .object({
    events: z
      .object({
        view: eventNames.default(['view_item']),
        cart: eventNames.default(['add_to_cart']),
        checkout: eventNames.default(['begin_checkout']),
      })
      .strict()
      .default({ view: ['view_item'], cart: ['add_to_cart'], checkout: ['begin_checkout'] }),
    windowHours: z.number().int().min(1).max(720).default(24),
  })
  .strict()
  .superRefine(({ events }, ctx) => {
    const names = Object.values(events).flat();
    if (new Set(names).size !== names.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Each event name must belong to exactly one action.',
      });
    }
  });
export type CommerceSettings = z.infer<typeof commerceSettingsSchema>;
export const DEFAULT_COMMERCE_SETTINGS = commerceSettingsSchema.parse({});

/** Order identity is authoritative. Names classify only observed pre-purchase actions. */
export function commerceStageSQL(
  dialect: 'prisma' | 'clickhouse',
  alias: string,
  events: CommerceSettings['events'] = DEFAULT_COMMERCE_SETTINGS.events,
) {
  const params: Record<string, string> = {};
  const clauses = Object.entries(events).map(([action, names]) => {
    const values = names.map((name, index) => {
      const key = `commerceAction_${action}_${index}`;
      params[key] = name;
      return dialect === 'prisma' ? `{{${key}}}` : `{${key}:String}`;
    });
    return values.length
      ? `when ${alias}.event_name in (${values.join(', ')}) then '${action}'`
      : '';
  });
  return {
    sql: `case when ${alias}.order_id ${dialect === 'prisma' ? 'is not null' : "!= ''"} then 'order' ${clauses.join(' ')} else 'unclassified' end`,
    params,
  };
}
