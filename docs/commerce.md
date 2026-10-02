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

Apply the unreleased PostgreSQL 28_add_commerce and ClickHouse 15_add_commerce.sql
migrations before sending commerce. Regenerate Prisma and rebuild/deploy the
tracker. The ClickHouse bootstrap schema includes the tables. Implementation work
does not apply migrations automatically.

Relational website reset/deletion and session deletion remove commerce records.
External cloud/ClickHouse lifecycle jobs must purge both tables and clean up
unreferenced snapshots. Those jobs are not in this repository and remain a cloud
deployment prerequisite. Never purge snapshots referenced by current parents.

## Reporting

The website **Commerce** report (Growth → Commerce, share section `commerce`) has five
tabs. Every query is built on `src/queries/sql/commerce/commerceQuery.ts`, which applies
the storage rules above in one place:

- Orders and revenue count completed payments only (`order_id` set). Cart and checkout
  events are read only by the checkout funnel.
- One currency at a time. Amounts are never summed or converted across currencies.
  Without an explicit choice the currency with the most orders is used.
- ClickHouse reads `commerce_event FINAL` and `commerce_item FINAL`, joined on
  `commerce_event_id` and `snapshot_id`, so retries and superseded snapshots never count.
- Website filters, segments and cohorts select sessions, as in the revenue report.
  A market filter narrows orders; a product or category filter keeps orders containing
  it and values them by that product's net line totals.
- Revenue is the order total including tax and shipping; product revenue is net line totals.

| Tab | Contents |
| --- | --- |
| Overview | Revenue, orders, AOV, buyers, conversion (converted visits / visits), revenue per visitor, units per order with comparison; revenue chart; revenue by channel, referrer, UTM, country, region, city, market, device, browser, OS, entry page and event; orders with item detail |
| Products | Products, variants or categories by revenue, units or orders; units-per-order distribution; frequently bought together; per-product detail |
| Checkout | Sessions reaching cart → checkout → payment, abandoned carts and checkouts with their value, median time to purchase |
| Customers | Buyers, new vs returning, repeat purchase rate, revenue per buyer, median time and visits to first purchase, buyer list |
| Attribution | Revenue by channel, referrer, ad platform, landing page and UTM, first click or last non-direct click |

Definitions:

- **Checkout stages** are inferred from IDs: an `orderId` is a payment, a `checkoutId`
  without an order is checkout, anything else is cart. A session counts toward every stage
  up to the furthest it reached, so sites that skip cart events still get a funnel.
  Funnels over arbitrary event names remain available in the Funnels report.
- **Buyers** are the visitor's distinct ID (`session_link`) when identified, otherwise the
  session. A buyer is **new** when their first-ever payment (any currency) is in the range.
  Time and visits to first purchase are measured within the purchasing session.
- **Attribution** touches are the visits of the purchasing session that started before the
  order, looking back 30 days before the range. Last click is the latest touch with an
  external referrer, campaign or ad click ID, falling back to the latest touch.
- **Acquisition dimensions** (referrer, channel, UTM, entry) on the Overview tab describe the
  visit in which the order was placed.

Elsewhere:

- **Breakdown** can add orders and revenue for one currency, joined per visit. A visit that
  spans several rows contributes its orders to each, as it does to visitor counts. Shares
  need the Commerce section to request it.
- **Goals** and **cohorts** accept a *Completed order* action, optionally limited to one
  product (`*` for any).
- **Boards** offer commerce metrics, revenue chart, revenue table, top products and the
  checkout funnel. The overview metrics bar shows revenue when the site has orders.
- **API**: `GET /api/websites/{websiteId}/commerce/{currencies,stats,chart,metrics,orders,
  orders/{commerceEventId},products,baskets,checkout,abandoned,customers,buyers,attribution}`.
  `buyers` also requires the Sessions section on shares.
- **MCP**: `get_commerce` and `get_commerce_products`. They need an API client with the
  commerce operations; the embedded `/mcp` endpoint has them, and the standalone CLI gets
  them once `@umami/api-client` is published with them and `@umami/mcp` depends on it.

Refunds, split payments, order edits, currency conversion and the external ClickHouse
purge jobs remain future work and need their own contracts.
