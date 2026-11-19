// Payment providers whose sales Umami Cloud imports. Every imported payment or refund is
// written as a custom event named `<provider>:payment` / `<provider>:refund`, either in
// the buyer's tracked session or in a synthetic session (one per provider customer) that
// has no tracked events. A revenue row can also outlive its event row, so imported revenue
// must never depend on finding a tracked session.
export const PAYMENT_PROVIDERS = [
  'stripe',
  'paddle',
  'lemonsqueezy',
  'polar',
  'shopify',
  'woocommerce',
  'dodopayments',
];

export const IMPORTED_REVENUE_EVENT_NAMES = PAYMENT_PROVIDERS.flatMap(provider => [
  `${provider}:payment`,
  `${provider}:refund`,
]);

const EVENT_NAME_LIST = IMPORTED_REVENUE_EVENT_NAMES.map(name => `'${name}'`).join(', ');

// SQL condition that is true for imported revenue events.
export function isImportedRevenue(eventNameColumn: string) {
  return `${eventNameColumn} in (${EVENT_NAME_LIST})`;
}
