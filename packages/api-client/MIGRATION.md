# Migrating from the hand-written `@umami/api-client`

The previous client (`umami-software/api-client`) maintained every endpoint by hand. This package
is generated from Umami's OpenAPI contract and replaces it. That repository will be archived once
this package is stable.

## What changed

| Before                                                  | After                                                                                   |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `getClient({ apiEndpoint, apiKey, userId, secret })`    | `new UmamiClient({ baseUrl, apiKey, token })`                                          |
| Methods return `{ ok, data, status, error }`            | Methods return the response body and **throw** `UmamiApiError` on non-2xx              |
| Positional arguments `getWebsiteStats(websiteId, params)` | Single object `getWebsiteStats({ websiteId, ...params })` (positional still works for common analytics methods, see below) |
| `getWebsites()`                                         | `listWebsites()` (`getWebsites` kept as a deprecated alias)                             |
| `userId` + `secret` mint a token client-side            | Removed. Mint the token yourself and pass `token`.                                      |

## Errors

```ts
// before
const { ok, data, error } = await client.getWebsiteStats(id, params);
if (!ok) { … }

// after
try {
  const data = await client.getWebsiteStats({ websiteId: id, ...params });
} catch (error) {
  if (isUmamiApiError(error)) { error.status; error.code; }
}
```

## Compatibility overloads

To ease upgrades these methods still accept the old positional form:

`getWebsite`, `updateWebsite`, `deleteWebsite`, `getWebsiteActive`, `getWebsiteDateRange`,
`getWebsiteStats`, `getWebsitePageviews`, `getWebsiteMetrics`, `getWebsiteExpandedMetrics`,
`getWebsiteEvents`, `getWebsiteEventSeries`, `getWebsiteEventStats`, `getEventData`,
`getEventDataStats`, `getEventDataProperties`, `getEventDataValues`, `getWebsiteSessions`,
`getWebsiteSessionStats`, `getWebsiteSession`, `getWebsiteSessionActivity`,
`getWebsiteSessionProperties`, `getWebsiteReports`.

They are deprecated and will be removed in the next major release. The object form is canonical.

## Method names

Method names are OpenAPI `operationId`s. Most match the old names (`getWebsiteStats`,
`runFunnelReport`, `getRealtime`, `createTeam`, …). Endpoints that were not in the old client are
now available automatically. Endpoints under `/api/admin`, `/api/config`, `/api/dashboard` and
other internal routes are intentionally excluded.

## Triage of the old surface

- **Kept**: websites, analytics, events, sessions, session data, reports, teams, users, boards,
  links, pixels, shares, account (`me`), auth, two-factor, tracking (`send`, `batch`, `record`).
- **Dropped**: admin endpoints (not part of the public API), client-side token minting.
