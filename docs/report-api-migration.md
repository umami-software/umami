# Report API migration

The website analytics APIs replace report execution endpoints. Analytics use GET; saved
funnels and goals have dedicated resource routes. The application and MCP use the new routes.
The report table and existing definition IDs are retained. No database migration is required.

## Calculation endpoints

Paths in the replacement column are relative to `/api/websites/{websiteId}`.

| Legacy POST endpoint | Replacement GET endpoint(s) |
| --- | --- |
| `/api/reports/attribution` | `/attribution` |
| `/api/reports/breakdown` | `/breakdown` |
| `/api/reports/funnel` | `/funnels/stats` or `/funnels/{funnelId}/stats` |
| `/api/reports/goal` | `/goals/stats` or `/goals/{goalId}/stats` |
| `/api/reports/heatmap` | `/heatmaps` |
| `/api/reports/journey` | `/journeys` |
| `/api/reports/performance` | `/performance/stats`, `/performance/chart`, `/performance/metrics` |
| `/api/reports/retention` | `/retention` |
| `/api/reports/revenue` | Existing `/revenue/stats`, `/revenue/chart`, `/revenue/metrics` |
| `/api/reports/utm` | `/utm/metrics` |

New requests use `startAt` and `endAt` in epoch milliseconds, with optional `timezone`, `unit`,
and existing filter parameters. Dates are normalized through the shared website filter pipeline,
including reset dates and account history limits. The report envelope and discriminator are gone.
Use a single date range; do not send separate filter dates and calculation dates.

`steps` on funnel previews and `fields` on breakdowns are JSON strings, URL-encoded normally.
Other criteria are individual query parameters. For example:

```ts
await client.getWebsiteFunnelStats({
  websiteId,
  startAt,
  endAt,
  timezone: 'UTC',
  window: 60,
  steps: JSON.stringify([
    { type: 'path', value: '/pricing' },
    { type: 'event', value: 'signup' },
  ]),
});
```

The calculation criteria remain feature-specific: journeys accept `steps`, `startStep`,
`endStep`, and `eventType`; attribution accepts `model`, `type`, and `step`; goal previews
accept `type` and `value`; heatmaps accept `urlPath` and `mode`. See `/openapi.json` for contracts.

Performance stats return the old `summary` object directly. Performance chart returns
`{ chart }`. Performance metrics return a single dimension array; `type` is `path`, `title`,
`device`, or `browser`. Chart and metrics accept `metric` (`lcp`, `inp`, `cls`, `fcp`, `ttfb`).
Stats calculate all metrics independently of the chart selection. The same percentile SQL is
used by legacy and new handlers.

UTM metrics return `{ utm, views }[]` for one `type`: `utm_source`, `utm_medium`, `utm_campaign`,
`utm_term`, or `utm_content`. The existing pageview counting rules, empty-value exclusion,
and 50-row limit are preserved. UTM board widgets request only their configured dimension.

Revenue endpoints retain their existing contracts. MCP `get_revenue` composes stats, chart,
and four dimension requests, preserving its previous output and comparison data.

## Saved definitions

| Method | Path (relative to website) | Purpose |
| --- | --- | --- |
| GET | `/funnels` | List definitions, with pagination/search |
| POST | `/funnels` | Create `{ name, description?, parameters }` |
| GET | `/funnels/{funnelId}` | Read definition |
| POST | `/funnels/{funnelId}` | Update `{ name, description?, parameters }` |
| DELETE | `/funnels/{funnelId}` | Delete definition |
| GET | `/funnels/{funnelId}/stats` | Calculate saved criteria with supplied dates/filters |
| GET | `/funnels/stats` | Calculate supplied criteria without saving |

Goals expose the same structure under `/goals`. Website and definition type are fixed by the
route and cannot be changed in an update body. IDs, names, descriptions, and board `reportId`
references are preserved. Saved stats validate stored criteria and require both definition access
and analytics-section access. Unsupported or malformed legacy criteria return 400 for stats;
the definition remains readable/editable through the compatibility API.

Section-based sharing is preserved. Heatmaps remain authenticated-only. New definition lists
support type-specific section sharing and exclude deleted websites. Legacy report list routes
retain their original, differing authentication behavior during the transition.

## Compatibility routing and removal gate

All legacy calculation and saved-report routes remain callable with their existing contracts.
Next.js rewrites the old URLs to handlers under `src/app/(compat)/compat/api` without
changing request methods, bodies, query parameters, or response shapes. These handlers live
outside `src/app/api`, so contract discovery, OpenAPI, and the generated SDK expose only the
new feature APIs. Existing clients can continue calling the old URLs; new SDK versions use
the replacements above. HTTP redirects to the feature APIs would not preserve compatibility
because the methods, request envelopes, and some response shapes differ.
Legacy handlers and new feature routes call the same SQL functions; no internal HTTP forwarding
is involved. Legacy calculation envelopes and date precedence remain unchanged.

Do not remove generic report CRUD solely because the current UI only saves funnels and goals.
Before scheduling removal:

1. Audit persisted report counts by type, including older definitions outside funnel/goal.
2. Audit malformed funnel/goal criteria that stricter feature APIs cannot calculate.
3. Decide how users can export, edit, migrate, or retain every other saved type.
4. Confirm external API clients have replacements for their operations and payloads.
5. Announce a compatibility window and the breaking release that will remove legacy routes.
6. Verify the application, boards, SDK examples, and MCP no longer call legacy endpoints.

No removal date or version is scheduled by this change. Historical records are preserved.

## Validation

Unit tests cover GET serialization, invalid structured input, normalized ranges, permission
checks, definition website/type mismatches, immutable update scope, SQL dataset separation for
PostgreSQL and ClickHouse, cache keys, SDK requests, MCP composition, and compatibility routing.

`tests/api/report-migration.spec.ts` exercises legacy/new result parity, saved-definition
lifecycles, shared access, and split datasets against the existing disposable API test stack.
It is intended to run in both database modes. Do not point it at a development or production
database: the API suite seeds and mutates test data. This migration was developed without a
running disposable API server; live backend parity remains a release verification step.

Regenerate and verify contracts with `pnpm generate:api`, `pnpm openapi:check`, and
`pnpm check:api:client`. Build packages before their tests so MCP resolves the current API client.
