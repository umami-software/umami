export const COMMERCE_EVENT_NAMES = {
  view: 'view_item',
  cart: 'add_to_cart',
  checkout: 'begin_checkout',
} as const;

/** Order identity is authoritative. Pre-purchase actions use predefined event names. */
export function commerceStageSQL(dialect: 'prisma' | 'clickhouse', alias: string) {
  const params: Record<string, string> = {};
  const clauses = Object.entries(COMMERCE_EVENT_NAMES).map(([action, name]) => {
    const key = `commerceAction_${action}`;
    params[key] = name;
    const value = dialect === 'prisma' ? `{{${key}}}` : `{${key}:String}`;
    return `when ${alias}.event_name = ${value} then '${action}'`;
  });
  return {
    sql: `case when ${alias}.order_id ${dialect === 'prisma' ? 'is not null' : "!= ''"} then 'order' ${clauses.join(' ')} else 'unclassified' end`,
    params,
  };
}
