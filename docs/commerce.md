# Commerce: independent orders and refunds

Commerce records facts supplied by a store. It does not track cart contents, reconstruct
item state, or require a browsing journey before accepting an order.

## Record an order

Server integrations use `POST /api/websites/{websiteId}/commerce` with normal API
credentials and website edit access. Shares cannot write. The smallest request is:

```json
{
  "orderId": "10001",
  "currency": "EUR",
  "total": "82.00"
}
```

This endpoint writes commerce data only. It does not manufacture a visitor, visit,
pageview or custom event. Use it for imports and server-side delivery.

`type` defaults to `order`. Orders represent completed sales: send one order after it
is paid, regardless of how many payment methods were used. Authorization attempts,
failed payments and unpaid checkouts are ordinary observations, not completed orders.
This is order analytics, not a payment-gateway ledger.

Optional fields:

- `source`: stable store namespace. Use it consistently for orders and refunds when
  several stores share an Umami website. IDs are unique within website + source.
- `occurredAt`: ISO UTC timestamp of the sale/refund (server endpoint only). Defaults
  to receipt time; retries preserve the first recorded occurrence.
- `customerId`: stable source customer identifier, namespaced by `source` for reporting.
  Without a customer ID or identified browser association, the buyer is unknown.
- `market`: explicit source market; not inferred from IP.
- `subtotal`, `shipping`, `tax`: optional authoritative breakdown amounts.
- `items`: optional order lines. Each has `productId`;
  `lineId`, `name`, `variant`, `category`, `price`, and `total` are optional.
- `updatedAt`: monotonic source revision timestamp for full order snapshot updates.

`total` is authoritative and includes whatever the source charged (including fees,
tips or duties). It is never reconstructed from items or a partial breakdown. Line
`total` is also authoritative, after discounts and excluding tax/shipping; `price` is
informational. Unknown price, line total, tax, shipping and subtotal remain null.
A supplied `price` does not imply a line total. Item quantities and counts are not collected
or reported.

Money accepts nonnegative numbers or decimal strings with up to four decimal places,
bounded at 999,999,999,999. Decimal strings avoid intermediate floating-point rounding.
Currency is an uppercase three-letter code. Reports never combine currencies.
Identifiers are limited to 200 characters and order details to 200 lines. Duplicate provided line IDs and unknown fields are rejected.
An order with no lines, zero total, or incomplete line detail is valid.

## Browser tracking

The existing named-event transport remains available when browser association is useful:

```js
await umami.track('purchase', {
  commerce: { orderId: '10001', currency: 'EUR', total: '82.00' },
});
```

This deliberately records the named custom event as well as the order. Commerce
requests reject on delivery failure so callers can retry, and disable fetch keepalive.
Server delivery is independent of page exits and browser tracking availability.
For collection requests, use `payload.timestamp` (Unix seconds) for occurrence time.

Behavior stays in ordinary custom events with whatever properties are known:

```js
umami.track('product_viewed', { productId: 'shirt' });
umami.track('product_added', { productId: 'shirt', quantity: 2 });
umami.track('checkout_started', { checkoutId: 'checkout-10001' });
```

These events do not create commerce records or change product/cart state. There are no
reserved commerce action names, cart IDs, checkout IDs, conversion windows, or required
cart snapshots. Generic funnels remain available for explicitly tracked behavior.

## Refunds

Send successful refunds as independent facts, including amount-only refunds:

```json
{
  "type": "refund",
  "source": "store-a",
  "orderId": "10001",
  "refundId": "refund-123",
  "currency": "EUR",
  "total": "12.00",
  "occurredAt": "2026-10-08T14:30:00Z"
}
```

Refunds need no items or prior order delivery. Their identities include website,
source, order ID and refund ID. Retries never create additional refunds. Refunds are
immutable; later deliveries of the same refund are ignored. A failed or pending
refund is not a completed refund and must not be sent yet.

## Revisions and storage

Without `updatedAt`, the first order wins and retries are ignored. With `updatedAt`,
a strictly newer full order snapshot replaces the old details. Send the original
occurrence and source revision on every retry. A replacement preserves the original
occurrence and browser association. Omitted details become unknown in the new snapshot;
updates are replacements, not patches. Currency cannot change for an existing identity.
Same-revision conflicting payloads are unsupported; reuse the original payload.

PostgreSQL serializes writes by logical identity with a transaction advisory lock.
ClickHouse publishes an item snapshot before its parent and uses the source revision
as `updated_at`, the ReplacingMergeTree version. Readers use FINAL and join items on
website, commerce ID and snapshot ID. Newer snapshots win out-of-order delivery.
Concurrent first deliveries must agree on currency, occurrence and source revision.

Browser-associated PostgreSQL collection remains transactional with the generic event.
ClickHouse generic event/property tables remain append-only: concurrent browser retries
can duplicate generic events even though commerce identities deduplicate. Standalone
server ingestion avoids those generic rows entirely.

## Reports and feature isolation

Commerce has Overview, Customers and Attribution tabs. All revenue/order
controls stay in Commerce; none are injected into Breakdown, Goals, cohorts, website
overview cards or Boards. Commerce-enabled shares can view this section independently.

- Revenue is the source order value for orders occurring in the selected period.
  Newer source snapshots update that order value; this is not a cash-receipt ledger.
- Refunds are counted in their own occurrence period, even when the sale was earlier.
  Sales less refunds is period order value minus period refunds, and may be negative.
  Revenue charts and acquisition tables show order value before refunds.
- Optional line items appear in order details. Missing amounts stay unknown.
- Customer analysis prefers source customer identity, then browser identity/session.
  Orders with neither are excluded from buyer counts, not merged into one fake buyer.
- Traffic conversion is unavailable when orders lack browser links or use market
  scope. Filtered numerators and denominators use matching sessions.
- Orders without observed attribution are unattributed, not assumed to be direct.

Checkout/abandoned-cart endpoints, product view/addition/conversion metrics and related
presets are removed. Commerce has no saved reports, saved-report endpoints, or board
components. Product/basket reports, product/category filters and the product MCP tool
are removed. Historical product or saved-report URLs open the overview.

## Shopify import adapter

`POST /api/websites/{websiteId}/commerce/shopify` accepts `{ shop, order }` with
selected Shopify GraphQL Admin order fields. It requires the same Umami edit
credentials as generic ingestion; it is not a webhook receiver. A trusted integration
fetches Shopify data and submits it here. OAuth, webhook subscription and background
synchronization are not configured by this endpoint.

Required order fields: `id`, `processedAt`, `updatedAt`, `displayFinancialStatus`,
and `totalPriceSet { shopMoney { amount currencyCode } }`. Optional fields are `test`,
`customer { id }`, and `transactions { id kind status processedAt amountSet {
shopMoney { amount currencyCode } } }`.

The adapter namespaces identities by shop, skips test/unpaid orders, uses order totals
before returns, and imports only successful REFUND transactions. Refund transaction
IDs deduplicate independently, including multiple refunds for one order. Failed,
pending and authorization transactions never count as refunds or extra orders. The
adapter imports totals/customer identity only; it does not invent missing line items.
Use a complete source transaction list when synchronizing historical refunds.

Source contracts: [Shopify Order](https://shopify.dev/docs/api/admin-graphql/latest/objects/Order)
and [Shopify Refund](https://shopify.dev/docs/api/admin-graphql/latest/objects/Refund).
A Refund object alone does not establish a successful money transfer.

## Deployment

Apply PostgreSQL migration `30_commerce_order_facts` and ClickHouse migration
`16_commerce_order_facts.sql` after the existing commerce migrations. Then apply
`31_remove_commerce_item_counts` and ClickHouse `17_remove_commerce_item_counts.sql`
to allow inserts without quantities while preserving historical stored values. Regenerate Prisma,
rebuild the tracker and regenerate/deploy the API client. No migration is applied by
source edits alone.

The migrations are additive: historical cart/checkout observations and old columns
remain stored, but reports exclude them. Website/session deletion continues to clean
commerce tables. External ClickHouse lifecycle jobs must purge both commerce tables
and orphan item snapshots without deleting snapshots referenced by live parents.

This is a breaking change to the unreleased item-state payload: integrations must supply
an order/refund total. Earlier payloads requiring inferred totals are rejected.
