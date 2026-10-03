# Commerce ingestion

Commerce uses the existing custom-event flow:

```js
await umami.track('bought-online', {
  source: 'email',
  commerce: {
    orderId: '10001',
    checkoutId: 'checkout-10001',
    currency: 'EUR',
    market: 'DE',
    shipping: 5,
    tax: 12,
    items: [
      { productId: 'shirt', variant: 'blue-m', price: 25, quantity: 2 },
      { productId: 'hat', category: 'accessories', price: 15, quantity: 1 },
    ],
  },
});
```

The server computes a subtotal of 65 and total of 82 using decimal arithmetic.
The wire envelope is `{ type: 'event', payload: { website, name, url, data } }`.
The event name is `bought-online`, and `data` contains `source` and `commerce`.
There is no commerce collection type, extra tracker method, or predefined action.
The parent supplies the event name, timestamp, website, session and visit.
Direct callers may use the existing `payload.timestamp` in Unix seconds.

## Validation and storage

`data.commerce` is reserved on named website events. It is validated before any
writes, then extracted into dedicated commerce tables. Other properties follow
normal event-data storage. Generic event/session array serialization is unchanged.
Links, pixels and unnamed pageviews cannot carry commerce. Identify data remains
ordinary session data. The collector's existing public trust model applies.

The presence of `orderId` identifies a completed payment regardless of event name.
Omit it for events before payment, using optional `cartId` or `checkoutId` instead.
Events without `orderId` retain item values without contributing to future
payment/revenue metrics. Empty or whitespace-only order IDs are rejected.

All commerce payloads require a three-letter currency code and 1–200 items.
Currency normalizes to uppercase. Market is explicit, not inferred from IP.
Items require productId, price and integer quantity; name, variant and category
are optional. Prices are net unit prices after discounts, excluding tax/shipping.
Money supports four decimal places, with price, tax and shipping bounded at
1,000,000 and quantity at 10,000. Tax/shipping default to zero and are allowed only
for payments. Free items and zero-total payments are valid. Identifiers are capped
at 200 characters. Unknown commerce/item fields are rejected, including the old
commerce action/id/timestamp fields. Names follow the normal 50-character event limit.

`commerce_event` shares its ID with `website_event.event_id`. It stores the event
name, session/visit association, market, currency, checkout/order IDs
and totals. `commerce_item` stores typed line attributes, quantities and money.
Items bypass the generic property-array serializer.

## Retries and delivery

For events carrying commerce, `track` rejects on HTTP/network errors so callers
can handle retries. Other events retain their best-effort behavior. Commerce
requests disable fetch keepalive to avoid its 64 KiB body budget. Await collection
before navigating or use server-side collection when delivery must survive page
exit. Tracking-disabled and before-send hooks still apply.

Payments derive a stable parent event ID from website + orderId, independent of
name, session, currency and APP_SECRET. Order IDs must be unique across all stores
and markets within a website. Reuse the original payload on retries. The first
completed payment wins; completed retries are ignored rather than treated as
corrections. One order represents one completed payment. Split payments,
installments and refunds require a future contract. Nonpayment events receive
random IDs and are not deduplicated.

PostgreSQL writes the parent, generic properties, legacy revenue (if separately
supplied), commerce record and items in one transaction. The unique parent ID
serializes concurrent payment retries. Failures roll back all those rows.

ClickHouse checks the commerce parent with FINAL and skips completed payment
retries. It writes the generic event/properties, then a complete item snapshot,
then publishes the parent pointer. Commerce-associated writes go directly to
ClickHouse even when ordinary events use Kafka, so failures surface to callers.

**ClickHouse limitation:** generic event/property tables use append-only MergeTree
storage. Concurrent retries, or failures after the generic insert but before
commerce completion, can duplicate generic rows. A deterministic ID alone does
not prevent that. Exactly-once generic counts need additional ingestion/deduplication
infrastructure. Dedicated payment counts deduplicate by commerce ID with FINAL.
Simultaneous differing payloads are not supported as an order-edit mechanism.

Read ClickHouse commerce parents and items with FINAL, joining on website_id,
commerce_event_id and snapshot_id. Raw items include superseded/orphan snapshots;
do not aggregate them without the current parent join. Parent partitions are
stable by website to allow deduplication across calendar boundaries.

Commerce does not automatically populate the legacy revenue dataset. Future
commerce reports must select rows with an order ID (`order_id IS NOT NULL` in
PostgreSQL, `order_id != ''` in ClickHouse) and keep currencies separate.

## Deployment and remaining work

Apply the unreleased PostgreSQL 27_add_commerce and ClickHouse 15_add_commerce.sql
migrations before sending commerce. Regenerate Prisma and rebuild/deploy the
tracker. The ClickHouse bootstrap schema includes the tables. Implementation work
does not apply migrations automatically.

Relational website reset/deletion and session deletion remove commerce records.
External cloud/ClickHouse lifecycle jobs must purge both tables and clean up
unreferenced snapshots. Those jobs are not in this repository and remain a cloud
deployment prerequisite. Never purge snapshots referenced by current parents.

This increment covers collection and storage. Payment/product queries,
configurable event-name funnels, commerce UI, saved reports and database integration
verification remain future work.
