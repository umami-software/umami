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

Apply the unreleased PostgreSQL 28_add_commerce and 29_commerce_config, plus ClickHouse 15_add_commerce.sql
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

- Orders and revenue count completed payments only (`order_id` set). Product conversion
  reads observed views, additions and purchases; checkout reports match identified attempts.
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
| Products | Products, variants and categories including zero-sale products; observed views/additions, same-product conversion rates, revenue, units and orders; volume/rate filters and presets; configurable columns |
| Checkout | Observed identified cart and checkout attempts, linked completions, pending and expired attempts, abandoned value, missing identifiers and unmapped events |
| Customers | Buyers, new vs returning, repeat purchase rate, revenue per buyer, median time and visits to first purchase, buyer list |
| Attribution | Revenue by channel, referrer, ad platform, landing page and UTM, first click or last non-direct click |

Definitions:

- **Actions** are mapped from existing event names in Commerce setup. Defaults are
  `view_item`, `add_to_cart` and `begin_checkout`. An order ID always means purchase.
  Mapping changes apply to historical reports. Unmapped nonpayment events are unclassified;
  they never imply cart activity. Each event name can map to only one action.
- **Product conversion** counts visits that view and later add/buy the same product in the
  same market. Repeated actions count once per product/visit. Variant grouping also matches
  variant identity; category grouping deduplicates visits after matching a same-product
  sequence. Both actions must fall inside the requested period. Cart-to-purchase uses adding visits as its denominator and requires a later purchase of the same product. Raw views/additions count
  distinct events containing the product. Revenue and units include all purchases in range.
- **Checkout attempts** use a stable checkout ID; cart attempts use a stable cart ID.
  IDs must be unique per attempt within a website/market/currency. Repeated snapshots retain
  the first observed start. Starts fall in the selected range; outcomes can occur across
  sessions and after the range, within the configured window (24 hours by default).
  Purchases never fabricate missing earlier steps. A cart progresses on a linked checkout
  or purchase; a checkout completes on a linked purchase. Open attempts remain pending
  until their window expires. Completion rate is completed / all observed checkouts,
  including pending attempts. Missing IDs and unmapped events are reported separately.
  `stages[].attempts` is the count; `sessions` remains a compatibility alias for that count.
- **Market scope** uses explicit commerce market values, including markets without purchases.
  The overview's traffic conversion and revenue-per-visitor are `null` for market/product/
  category scopes because website traffic lacks equivalent attribution. The UI explains
  their unavailability. Product and checkout conversions use matching commerce denominators.
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

## Saved commerce reports

Products and Checkout expose Save and Save as. Saved definitions include the report type,
market/product/category scope, currency, grouping, sort, minimum views, maximum cart rate,
search, website filters, columns, timezone, conversion window and date policy. Rolling dates
use the same calendar-day/timezone rules as the website date selector and advance on reopen;
fixed dates preserve UTC instants. Edit view restores the saved criteria for adjustment.
Saved reports are visible to website teammates and Commerce-enabled shares. Writes require
website edit access. Reports are stored as `Report.type = commerce` with a validated version-1
parameters object; unsupported versions are readable but not calculated.

Add to board stores a reference to the saved definition. The Saved commerce report component
uses saved dates by default; its Date range option can explicitly use board dates. Board date
changes never replace the saved currency, market or filters. Deleting a report leaves an
unavailable widget until it is removed or reconfigured.

New APIs:

- GET/POST `/commerce/settings`: website event-name mappings and default checkout window.
  Settings reside in the metadata PostgreSQL database in both analytics storage modes.
- GET `/commerce/markets`: markets with any commerce activity, including zero-order markets.
- GET/POST `/commerce/reports`: list/create definitions.
- GET/POST/DELETE `/commerce/reports/{reportId}`: read/update/delete a definition.
- GET `/commerce/reports/{reportId}/stats`: evaluate the saved definition. Optional paired
  `startAt`/`endAt` override only dates for boards; other URL scope overrides are ignored.

Integration payloads: views contain products viewed, additions contain only the items added,
and checkout events contain the full basket. Send the checkout ID through purchase and the
cart ID through checkout to link those attempts. A transaction's prices are net of discounts.

## Verification

`commerce.integration.test.ts` exercises real ingestion, payment retries, mixed-price baskets,
zero-sale products/markets, product/variant/category conversion, separate attempts, historical
starts, cross-session completion after the report range and pending attempts. It runs only
when `COMMERCE_TEST_DATABASE_URL` explicitly names a disposable loopback PostgreSQL database
with migrations applied. Set `COMMERCE_TEST_CLICKHOUSE_URL` as well to run the same assertions
against a disposable ClickHouse database initialized with `db/clickhouse/schema.sql`.
The tests add randomly identified fixture websites; never point them at application databases.

Unit/component tests cover settings validation, saved dates including DST, report access,
immutable scopes, presets, saving report state, and saved/board rendering.
