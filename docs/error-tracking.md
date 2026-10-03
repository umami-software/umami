# Browser error tracking

Error tracking collects JavaScript exceptions from tracked websites and groups them into issues. It is disabled by default and does not create analytics events or pageviews.

## Deploy

1. Apply PostgreSQL migrations with `pnpm db:migrate`. The error-tracking migration is `prisma/migrations/28_add_error_tracking/migration.sql`. Review any other pending migrations before running this command against a shared database.
2. If using ClickHouse, apply `db/clickhouse/migrations/16_add_error_tracking.sql` to the configured database (adjust the `umami` database qualifier if necessary). New installations can use the updated schema.
3. Generate the Prisma client and build/deploy the application and tracker through the normal build pipeline. Deploy the database changes before serving the new application.
4. Schedule `pnpm errors:cleanup` daily from the application directory, with the same database environment as the application. A cron job, systemd timer, or Windows Task Scheduler can run this command. It does not start a server.

Errors use PostgreSQL for issue workflow state and quotas. Occurrences use PostgreSQL or ClickHouse according to `CLICKHOUSE_URL`. Kafka is deliberately bypassed: collection acknowledges successful direct writes, and reports storage failures to the tracker for bounded retries.

## Enable collection

Enable collection through `PUT /api/websites/{websiteId}/errors/settings` with `{ "enabled": true, "retentionDays": 30 }`. Retention can be 1–90 days (default: 30). Website owners and members with website update permission can change settings or issue status. Authenticated website viewers can inspect errors; public analytics shares cannot.

When `UMAMI_SELF_TRACK` is set to a website ID, Umami automatically enables browser error capture and server collection for that website. No separate error-tracking setting is needed. The settings API reports it as enabled while self-tracking is configured, even if the website's saved error-tracking setting is disabled.

Add these attributes to the website's existing Umami tracking script:

```html
data-errors="true"
data-release="web@1.4.2"
data-environment="production"
```

For example:

```html
<script defer
  src="https://analytics.example.com/script.js"
  data-website-id="YOUR-WEBSITE-ID"
  data-errors="true"
  data-release="web@1.4.2"
  data-environment="production"></script>
```

Errors are sent as `{ type: "error", payload: ... }` to the same collection endpoint as analytics events, `/api/send` by default. They use the tracker's configured host and `COLLECT_API_ENDPOINT`, including Cloudflare worker and custom proxy routing. There is no separate error collection URL. Reload the tracked page after changing collection settings.

Uncaught exceptions and unhandled promise rejections are captured after the script executes. Errors before the tracker loads, resource load failures, worker errors, and server-side exceptions are not automatically captured. Cross-origin scripts may expose only a generic `Script error.` unless their CORS configuration permits details.

Report caught exceptions, including from framework error boundaries, with:

```js
await umami.captureException(error, {
  release: 'web@1.4.2',        // optional override
  environment: 'production', // optional override
  tags: { feature: 'checkout' },
  fingerprint: ['checkout-payment'], // optional explicit grouping
});
```

Capture is best effort, never throws into the host application, and respects the tracker's domain restrictions, opt-out storage flag, and configured Do Not Track behavior. It requires `data-errors="true"` for both automatic and manual capture. It can operate when automatic pageview tracking is disabled.

## Privacy and limits

- URLs omit query strings and fragments. Common email addresses, JWTs, and named credentials are scrubbed in the browser and again on the server. This is best-effort redaction, not a guarantee that arbitrary application text is free of sensitive data.
- Console logs, request bodies, cookies, local variables, and arbitrary rejection objects are not automatically serialized. Only explicit string tags are accepted.
- The existing `data-before-send` hook receives `type === 'error'` and can modify the payload or return `null` to drop it. Use it to remove application-specific sensitive paths, messages, stack data, and tags before transmission.
- A payload is limited to 48,000 UTF-8 bytes; messages to 2,000 characters; stacks to 16,000 characters and 50 parsed frames; tags to 20 entries. The tracker drops an oversized serialized report.
- A page captures at most 20 errors per minute, keeps at most 20 queued reports, suppresses the same exception object for one second, and attempts delivery at most three times. HTTP 429 clears the queue and pauses capture according to `Retry-After`.
- The default server quota is 120 collection requests per website per minute, shared across app instances using PostgreSQL. Configure it with `ERRORS_PER_MINUTE` (1–100,000). Retries consume quota. Website IDs and collection tokens are public collection identifiers, not write secrets.
- Enable `DEBUG=umami:errors` for per-process ingestion outcome counters without error payloads. These count requests, including accepted duplicate deliveries; they are not billing or occurrence totals.

## Investigate issues

The Errors list supports date, status, message search, release, environment, browser, and page-path filters. Counts and first/last seen refer to the selected period. Daily trends use UTC. Affected visits are distinct Umami visit IDs, not a count of individual people.

Issues group by a versioned fingerprint of exception type and available normalized stack frames, falling back to a normalized message. Custom fingerprints replace automatic grouping. Release and environment remain filters instead of always creating new issues. Minified code and deployment changes can still split or merge groups imperfectly.

Select an issue to inspect occurrences and their raw stack traces, change status, and open a session. A replay link appears only if a recording covers that occurrence's website, session, visit, and timestamp. Error collection works without recording; sampled or disabled recording may leave no replay.

Resolving or ignoring changes workflow state; it does not discard subsequent occurrences. Automatic reopening, alerts, source-map uploads/processing, release regression detection, breadcrumbs, and backend SDKs are deferred.

## Storage and retention

The client assigns a stable occurrence ID across retries. PostgreSQL uses a composite primary key and a transaction for issue/event insertion. ClickHouse uses `ReplacingMergeTree` keyed by website and event ID, stable partitions, and `FINAL` reads; physical duplicate rows do not inflate displayed counts. A failed ClickHouse write can leave an empty PostgreSQL issue, which the list excludes. No immediate cross-database transaction is claimed.

Retention is enforced on reads using receipt time. The daily cleanup command removes expired occurrences and old issues with no retained occurrences. Issue metadata may remain until that cleanup runs. ClickHouse additionally has a 90-day TTL as an upper-bound fallback. Lowering retention hides expired occurrences immediately; schedule cleanup for physical removal. Changes to an event's release/status do not extend retention.

Website reset/deletion removes error events, issue state, and quota state, including ClickHouse occurrences. Keep these tables in backup/restore procedures alongside the website configuration.
