# Ad spend tracking: implementation plan

Status: plan, not started. Target branch: `claude/umami-ad-spend-tracking-njporw`.

This document is written for an implementing agent. It assumes no prior context
about umami and names the exact files, conventions, and commands to use. Read
the "Decisions already made" section before writing code; do not reopen those.

## 1. Goal

Add a per-website **Ads** report that shows what each paid campaign cost next
to what umami measured for it (visits, revenue), so users get CPC, cost per
conversion and ROAS inside umami. Cost data arrives through connected ad
platform accounts (Google Ads and Meta first) or through a manual import.

## 2. What already exists (do not rebuild)

| Capability | Where |
|---|---|
| Click IDs and UTM params captured server-side on every event: `utm_source/medium/campaign/content/term`, `gclid`, `fbclid`, `msclkid`, `ttclid`, `li_fat_id`, `twclid` | `src/app/api/send/route.ts:209-222`, columns on `website_event` (`prisma/schema.prisma` `WebsiteEvent`, `db/clickhouse/schema.sql`) |
| Paid-vendor labelling by click ID (`Google Ads`, `Facebook / Meta`, ...) | `src/queries/sql/reports/getAttribution.ts:127-141` |
| Revenue table with currency, per session and event | `Revenue` model, `src/queries/sql/reports/getRevenueStats.ts` (join pattern `filtered_sessions` → `revenue`) |
| Report framework: Zod enum + discriminated union, one POST route per type, one page folder per type, generic client runner | `src/lib/schema.ts:150-331`, `src/app/api/reports/<type>/route.ts`, `src/app/(main)/websites/[websiteId]/(reports)/<type>/`, `src/components/hooks/queries/useResultQuery.ts` |
| Dual-backend query pattern (`runQuery({[PRISMA]…,[CLICKHOUSE]…})`) | `src/lib/db.ts`, any file in `src/queries/sql/reports/` |
| AES-256-GCM encrypt/decrypt keyed from `APP_SECRET` | `src/lib/crypto.ts` (`encrypt`, `decrypt`, `secret`) |
| Signed, encrypted short-lived tokens | `src/lib/jwt.ts` (`createSecureToken`, `parseSecureToken`) |
| Permission helpers | `src/permissions/` (`canViewWebsiteSection`, `canUpdateWebsite`, `canViewAuthenticatedWebsite`) |
| Per-website settings page as a stack of panels | `src/app/(main)/websites/[websiteId]/settings/WebsiteSettings.tsx` |
| Website nav and share-section lists | `src/components/hooks/useWebsiteNavItems.tsx`, `src/permissions/share.ts`, `src/app/(main)/websites/[websiteId]/settings/constants.ts`, `src/permissions/report.ts` |
| i18n | keys in `src/components/messages.ts` (`labels.<x> = 'label.<x>'`), strings in `public/intl/messages/en-US.json` (nested: `label: { x: '...' }`), check with `node scripts/check-missing-messages.js` |
| OpenAPI contracts generated per route | `pnpm openapi:contracts` writes `contract.generated.ts` next to each `route.ts`; `pnpm openapi:check` validates |

Nothing in the repo does outbound OAuth, stores third-party tokens, or runs
scheduled jobs. Those are new.

## 3. Decisions already made

1. **Storage is Postgres only.** Ad spend volume is campaigns × days. Both new
   tables are Prisma models with no ClickHouse counterpart, like `report`,
   `link`, `revenue`. The report merges Postgres spend rows with analytics rows
   (Postgres or ClickHouse) **in application code**, never in SQL.
2. **Join modes.** Each integration has `matchMode`:
   - `platform` (default): all sessions carrying that provider's click ID
     (`gclid` for Google, `fbclid` for Meta, `msclkid` for Microsoft,
     `li_fat_id` for LinkedIn, `ttclid` for TikTok) are attributed to the
     provider's total spend. Works with no URL tagging.
   - `campaignName`: `website_event.utm_campaign` equals the platform campaign
     name (case-insensitive).
   - `campaignId`: `website_event.utm_campaign` equals the platform campaign ID
     as a string. The settings UI shows the tracking template to paste
     (`{campaignid}` ValueTrack for Google, `{{campaign.id}}` for Meta).
3. **Currency is stored, not converted.** Every `ad_spend` row carries the
   account currency (Google cost is `cost_micros / 1e6`). The report takes a
   required `currency` parameter like the revenue report and includes only
   spend rows whose currency matches. Rows in other currencies are counted and
   surfaced as a warning in the response (`excludedCurrencies`). FX conversion
   is a follow-up.
4. **Sync is pull-on-demand plus a manual trigger.** No job runner. The report
   route refreshes any integration whose `lastSyncAt` is older than
   `AD_SYNC_INTERVAL` minutes (default 360). A `POST .../sync` route lets the
   UI button and any external cron trigger a sync. Concurrency guard: set
   `syncStatus = 'running'` with a conditional `updateMany` before syncing;
   if the update matched 0 rows, another sync is in progress, skip.
5. **Sync window.** First sync pulls 90 days. Incremental syncs re-pull the
   last 30 days (platforms restate recent data) and upsert on
   `(integrationId, campaignId, date)`.
6. **Credentials.** OAuth refresh tokens and long-lived tokens are encrypted
   with `encrypt(value, secret())` from `src/lib/crypto.ts` and stored in
   `ad_integration.credentials` as one encrypted JSON blob. Rotating
   `APP_SECRET` invalidates them, same as auth tokens; document that.
7. **Provider app credentials come from env vars.** Self-hosted users register
   their own Google Cloud OAuth client + Google Ads developer token, and their
   own Meta app. Umami Cloud sets the same env vars with its own verified apps.
   A provider whose env vars are absent is simply not offered in the UI.
   `manual` is always available.
8. **Report type name is `ads`.** Section name for sharing and nav is `ads`.
   URL: `/websites/[websiteId]/ads`.
9. **Scope for MVP:** Google Ads, Meta, manual import. Microsoft, LinkedIn and
   TikTok are follow-ups but the provider interface and `matchMode.platform`
   click-ID mapping must already list them.
10. **Conversions in MVP = umami revenue.** Report columns: spend, impressions,
    platform clicks, platform-reported conversions, umami visits, umami
    revenue, then CPC (spend / platform clicks), cost per visit
    (spend / umami visits), ROAS (revenue / spend). Goal-based conversions
    are a follow-up.

## 4. Environment variables (new)

| Variable | Purpose |
|---|---|
| `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET` | OAuth client from Google Cloud. Scope `https://www.googleapis.com/auth/adwords` |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | From the Google Ads manager account API Center |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Optional manager (MCC) ID sent as `login-customer-id` header when accounts are managed under an MCC |
| `META_APP_ID`, `META_APP_SECRET` | Facebook Login app with `ads_read` permission |
| `AD_SYNC_INTERVAL` | Minutes between automatic syncs. Default 360 |
| `AD_INTEGRATIONS_DISABLED` | Set to `1` to hide the feature entirely |

Expose `adProviders: string[]` (configured providers) from
`src/app/api/config/route.ts` so the client can render only usable connect
buttons. Read it in the UI through `useConfig()` (`src/components/hooks/useConfig.ts`).

## 5. Data model

Migration directory: `prisma/migrations/27_add_ad_spend/migration.sql`
(two-digit ordinal prefix, hand-written SQL in the style of
`26_add_api_key/migration.sql`). Then update `prisma/schema.prisma` and run
`pnpm build-db-client`.

```prisma
model AdIntegration {
  id            String    @id() @map("ad_integration_id") @db.Uuid
  websiteId     String    @map("website_id") @db.Uuid
  userId        String?   @map("user_id") @db.Uuid
  provider      String    @db.VarChar(50)      // 'google' | 'meta' | 'manual' | 'microsoft' | 'linkedin' | 'tiktok'
  accountId     String?   @map("account_id") @db.VarChar(100)   // Google customer ID (digits only) or Meta act_<id>
  accountName   String?   @map("account_name") @db.VarChar(200)
  currency      String?   @db.VarChar(10)      // account currency reported by the platform
  matchMode     String    @default("platform") @map("match_mode") @db.VarChar(20)
  credentials   String?   @db.Text            // encrypt(JSON.stringify({...}), secret())
  syncStatus    String?   @map("sync_status") @db.VarChar(20)   // 'idle' | 'running' | 'error'
  syncError     String?   @map("sync_error") @db.VarChar(500)
  lastSyncAt    DateTime? @map("last_sync_at") @db.Timestamptz(6)
  createdAt     DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt     DateTime? @updatedAt @map("updated_at") @db.Timestamptz(6)
  deletedAt     DateTime? @map("deleted_at") @db.Timestamptz(6)

  website Website   @relation(fields: [websiteId], references: [id])
  adSpend AdSpend[]

  @@index([websiteId])
  @@map("ad_integration")
}

model AdSpend {
  id                  String    @id() @map("ad_spend_id") @db.Uuid
  websiteId           String    @map("website_id") @db.Uuid
  integrationId       String    @map("integration_id") @db.Uuid
  provider            String    @db.VarChar(50)
  date                DateTime  @db.Date
  campaignId          String    @map("campaign_id") @db.VarChar(100)
  campaignName        String?   @map("campaign_name") @db.VarChar(255)
  currency            String    @db.VarChar(10)
  spend               Decimal   @db.Decimal(19, 4)
  impressions         BigInt    @default(0)
  clicks              BigInt    @default(0)
  conversions         Decimal?  @db.Decimal(19, 4)   // platform-reported
  conversionValue     Decimal?  @map("conversion_value") @db.Decimal(19, 4)
  createdAt           DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt           DateTime? @updatedAt @map("updated_at") @db.Timestamptz(6)

  website     Website        @relation(fields: [websiteId], references: [id])
  integration AdIntegration  @relation(fields: [integrationId], references: [id], onDelete: Cascade)

  @@unique([integrationId, campaignId, date])
  @@index([websiteId, date])
  @@map("ad_spend")
}
```

Add the two relation arrays to `model Website`. Credentials must never be
returned by any API: every Prisma read of `AdIntegration` that reaches a
response goes through a `select` that omits `credentials`.

Queries: `src/queries/prisma/adIntegration.ts` and
`src/queries/prisma/adSpend.ts`, exported from `src/queries/prisma/index.ts`.
Follow `src/queries/prisma/apiKey.ts` for shape. Required functions:

- `getWebsiteAdIntegrations(websiteId)` (excludes `deletedAt`, omits credentials)
- `getAdIntegration(id)` (internal, includes credentials) and
  `getAdIntegrationSafe(id)` (omits credentials)
- `createAdIntegration(data)`, `updateAdIntegration(id, data)`,
  `deleteAdIntegration(id)` (soft delete, and hard-delete its `ad_spend` rows)
- `claimAdIntegrationSync(id, staleBefore: Date)` → `updateMany` where
  `syncStatus != 'running' OR lastSyncAt < staleBefore`, returns matched count
- `upsertAdSpend(rows)` in batches of 500 using `prisma.client.$transaction`
  of `upsert` on the unique key
- `getAdSpend(websiteId, { startDate, endDate, currency, integrationIds? })`
  returning rows grouped by `provider, campaignId, campaignName, currency`
  with `sum(spend), sum(impressions), sum(clicks), sum(conversions),
  sum(conversionValue)`; and a second query returning
  `distinct currency` for the same range so the report can list
  `excludedCurrencies`.

## 6. Provider layer

Directory `src/lib/ads/`.

`types.ts`:

```ts
export type AdProvider = 'google' | 'meta' | 'manual' | 'microsoft' | 'linkedin' | 'tiktok';

export interface AdAccount { id: string; name: string; currency?: string }

export interface AdSpendRow {
  date: string;            // YYYY-MM-DD in the account's reporting timezone
  campaignId: string;
  campaignName: string;
  currency: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions?: number;
  conversionValue?: number;
}

export interface AdProviderAdapter {
  provider: AdProvider;
  isConfigured(): boolean;
  getAuthorizeUrl(state: string, redirectUri: string): string;
  exchangeCode(code: string, redirectUri: string): Promise<Record<string, unknown>>; // credentials blob
  refreshCredentials?(credentials: Record<string, unknown>): Promise<Record<string, unknown>>;
  listAccounts(credentials: Record<string, unknown>): Promise<AdAccount[]>;
  fetchDailySpend(
    credentials: Record<string, unknown>,
    accountId: string,
    range: { startDate: Date; endDate: Date },
  ): Promise<AdSpendRow[]>;
}
```

`index.ts`: `getAdProvider(name)`, `getConfiguredAdProviders()`, and the
click-ID map used by `matchMode = 'platform'`:

```ts
export const AD_PROVIDER_CLICK_ID: Record<AdProvider, string | null> = {
  google: 'gclid', meta: 'fbclid', microsoft: 'msclkid',
  linkedin: 'li_fat_id', tiktok: 'ttclid', manual: null,
};
```

Use native `fetch`. Do not add SDK dependencies. Every outbound call goes
through one helper `adsFetch(url, init)` in `src/lib/ads/http.ts` that sets a
10 s timeout via `AbortController`, throws a typed `AdProviderError`
(`{ provider, status, message }`), and never logs tokens.

### 6.1 Google Ads (`google.ts`)

- Authorize URL: `https://accounts.google.com/o/oauth2/v2/auth` with
  `scope=https://www.googleapis.com/auth/adwords`, `access_type=offline`,
  `prompt=consent`, `response_type=code`, `state`.
- Token exchange and refresh: `https://oauth2.googleapis.com/token`. Store
  `{ refreshToken }` only. Fetch an access token per sync.
- Headers on every Ads API call: `Authorization: Bearer`,
  `developer-token`, and `login-customer-id` when
  `GOOGLE_ADS_LOGIN_CUSTOMER_ID` is set.
- `listAccounts`: `GET /customers:listAccessibleCustomers`, then for each
  resource name query `customer.id, customer.descriptive_name,
  customer.currency_code, customer.manager` and drop managers.
- `fetchDailySpend`: `POST /customers/{id}/googleAds:searchStream` with

  ```sql
  SELECT campaign.id, campaign.name, segments.date, customer.currency_code,
         metrics.cost_micros, metrics.impressions, metrics.clicks,
         metrics.conversions, metrics.conversions_value
  FROM campaign
  WHERE segments.date BETWEEN 'YYYY-MM-DD' AND 'YYYY-MM-DD'
    AND campaign.status != 'REMOVED'
  ```

  `spend = cost_micros / 1_000_000`. Use the newest Google Ads API version
  that is not sunset at implementation time (check
  https://developers.google.com/google-ads/api/docs/release-notes) and put it
  in one constant `GOOGLE_ADS_API_VERSION`.
- Customer IDs are stored digits-only (strip dashes).

### 6.2 Meta (`meta.ts`)

- Graph version in one constant `META_GRAPH_VERSION` (docs currently show
  `v25.0`; verify at implementation time).
- Authorize URL: `https://www.facebook.com/{v}/dialog/oauth` with
  `scope=ads_read`, `response_type=code`, `state`.
- Exchange: `GET /{v}/oauth/access_token` with the code, then immediately
  exchange for a long-lived token
  (`grant_type=fb_exchange_token`). Store `{ accessToken, expiresAt }`.
  `refreshCredentials` re-exchanges when within 7 days of expiry; if the
  token is already expired, set `syncStatus = 'error'` with a
  "reconnect required" message.
- `listAccounts`: `GET /{v}/me/adaccounts?fields=id,name,account_id,currency`.
- `fetchDailySpend`: `GET /{v}/{act_id}/insights` with
  `level=campaign`, `time_increment=1`,
  `fields=campaign_id,campaign_name,spend,impressions,clicks,account_currency,date_start,actions,action_values`,
  `time_range={"since":...,"until":...}`, `limit=500`, follow
  `paging.next`. Map `conversions` from the `actions` entry with
  `action_type = 'purchase'` when present, else omit. For ranges over 90 days,
  chunk into 90-day requests.

### 6.3 Manual (`manual.ts`)

`isConfigured()` returns true. `getAuthorizeUrl`, `exchangeCode`,
`listAccounts` throw `not supported`. Data enters through the import route
(section 7.4).

### 6.4 Sync (`sync.ts`)

```ts
export async function syncAdIntegration(integrationId: string, opts?: { force?: boolean; startDate?: Date; endDate?: Date }): Promise<{ rows: number } | { skipped: true }>
export async function syncStaleWebsiteIntegrations(websiteId: string): Promise<void>
```

Steps: claim (section 5) → decrypt credentials → `refreshCredentials` if
present → `fetchDailySpend` for the window (90 days when `lastSyncAt` is
null, else 30 days, or the explicit range) → `upsertAdSpend` → set
`syncStatus = 'idle'`, `lastSyncAt = now`, `syncError = null`, and update
`currency` from the rows if unset. On any error set `syncStatus = 'error'`
and `syncError` to a message safe to show (no tokens, no full response
bodies), then rethrow only for the manual sync route. `syncStaleWebsiteIntegrations`
runs providers in parallel with `Promise.allSettled` and swallows errors; it
is called from the report route and must never fail the report.

## 7. API routes

Follow `src/app/api/websites/[websiteId]/annotations/route.ts` for the
shape: Zod schema, `parseRequest`, `if (error) return error()`, await
`params`, permission check, query, `json()`. Add the Zod schemas to
`src/lib/schema.ts` next to `annotationSchema`.

### 7.1 `src/app/api/websites/[websiteId]/ad-integrations/route.ts`

- `GET`: `canViewAuthenticatedWebsite`. Returns integrations without
  credentials plus `providers: getConfiguredAdProviders()`.
- `POST`: `canUpdateWebsite`. Body `{ provider: 'manual', accountName, currency, matchMode }`.
  Only `manual` may be created here; OAuth providers are created by the
  callback.

### 7.2 `src/app/api/websites/[websiteId]/ad-integrations/[integrationId]/route.ts`

- `GET`: safe read.
- `POST`: update `{ accountId?, accountName?, matchMode?, currency? }`. When
  `accountId` changes, delete that integration's `ad_spend` rows and reset
  `lastSyncAt` so the next sync is a full 90-day pull. Verify the integration
  belongs to `websiteId`.
- `DELETE`: soft delete plus `ad_spend` purge.

### 7.3 `.../[integrationId]/sync/route.ts`

`POST`, `canUpdateWebsite`, body `{ startDate?, endDate? }` (max 365 days).
Calls `syncAdIntegration(id, { force: true, ... })`. Returns
`{ rows }` or `{ error }` with status 400 via `badRequest()` when the
provider raised `AdProviderError`.

### 7.4 `.../[integrationId]/spend/route.ts` (manual import)

`POST`, `canUpdateWebsite`, integration must be `provider = 'manual'`. Body:

```ts
z.object({
  rows: z.array(z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    campaignId: z.string().max(100),
    campaignName: z.string().max(255).optional(),
    currency: z.string().max(10),
    spend: z.coerce.number().min(0),
    impressions: z.coerce.number().int().min(0).optional(),
    clicks: z.coerce.number().int().min(0).optional(),
    conversions: z.coerce.number().min(0).optional(),
    conversionValue: z.coerce.number().min(0).optional(),
  })).min(1).max(5000),
})
```

Upserts and returns `{ rows }`. This endpoint also works with API keys
(`src/lib/api-key.ts`), which is the self-hoster's path for cron-driven CSV
loads without OAuth.

### 7.5 OAuth: `src/app/api/ad-integrations/[provider]/authorize/route.ts` and `.../callback/route.ts`

- `authorize` `GET ?websiteId=`: `canUpdateWebsite`. Build `state` with
  `createSecureToken({ websiteId, userId, provider }, secret())` (expires in
  10 min, see `src/lib/jwt.ts`). Redirect URI is
  `${APP_URL or request origin}/api/ad-integrations/${provider}/callback`.
  Return `json({ url })`; the client navigates. Do not 302 from an API
  route that is called with a bearer header.
- `callback` `GET ?code=&state=`: `skipAuth: true` in `parseRequest`
  because the browser arrives without the bearer header. Parse and verify
  `state`, `exchangeCode`, create the integration with `accountId = null`
  and encrypted credentials, then return `NextResponse.redirect(...)` (there is
  no redirect helper in `src/lib/response.ts`) to
  `/websites/${websiteId}/settings?integration=${id}`. On failure redirect
  to the same page with `?integrationError=<code>`. Handle `error=` from
  the provider (user denied).

### 7.6 `.../ad-integrations/[integrationId]/accounts/route.ts`

`GET`, `canUpdateWebsite`. Decrypts credentials and returns
`listAccounts()`. Used by the account picker right after the callback.

### 7.7 `src/app/api/reports/ads/route.ts`

Same five-line shape as `src/app/api/reports/utm/route.ts`, permission
section `'ads'`. Calls `syncStaleWebsiteIntegrations(websiteId)` (only when
`auth.user` exists, never for share tokens) and then `getAdsReport`.

### 7.8 Config

Add `adProviders` and `adIntegrationsEnabled` to
`src/app/api/config/route.ts`.

## 8. Report query

`src/queries/sql/reports/getAdsReport.ts` exporting:

```ts
export interface AdsReportParameters { startDate: Date; endDate: Date; currency: string }
export interface AdsReportRow {
  provider: string; campaignId: string | null; campaignName: string | null;
  spend: number; impressions: number; clicks: number; conversions: number; conversionValue: number;
  visits: number; visitors: number; revenue: number;
  cpc: number | null; costPerVisit: number | null; roas: number | null;
}
export interface AdsReportResult {
  rows: AdsReportRow[];
  totals: Omit<AdsReportRow, 'provider' | 'campaignId' | 'campaignName'>;
  excludedCurrencies: string[];
  integrations: { id: string; provider: string; matchMode: string; lastSyncAt: Date | null; syncStatus: string | null; syncError: string | null }[];
}
```

Algorithm:

1. Load integrations for the website (safe read).
2. `getAdSpend(...)` grouped by provider and campaign for the currency.
3. Analytics side, two new dual-backend queries in
   `src/queries/sql/reports/getAdCampaignMetrics.ts`, each with a
   `relationalQuery` and a `clickhouseQuery` and using `parseFilters` like
   `getUTM.ts`:
   - `byCampaign`: group `website_event` rows with
     `coalesce(utm_campaign,'') != ''` by `lower(utm_campaign)`; return
     `visits = count(distinct visit_id)`, `visitors = count(distinct session_id)`,
     and `revenue = sum(revenue.revenue)` joined through
     `filtered_sessions` exactly as `getRevenueStats.ts` does, filtered to
     the report currency. ClickHouse uses `website_revenue`.
   - `byClickId`: one row per click-ID column
     (`gclid`, `fbclid`, `msclkid`, `li_fat_id`, `ttclid`) with the same
     three metrics where `coalesce(col,'') != ''`. Emit it as a `union all`
     of five selects each labelled with a `provider` literal.
   Query the raw `website_event` table, not `website_event_stats_hourly`.
4. Merge in JS per integration `matchMode`:
   - `platform`: one row per provider; analytics from `byClickId[provider]`.
   - `campaignName`: key `lower(campaignName)` against `byCampaign`.
   - `campaignId`: key `campaignId` against `byCampaign`.
   Unmatched spend rows keep zeros for the analytics columns; spend is never
   dropped.
5. Compute `cpc = clicks ? spend / clicks : null`, `costPerVisit`, `roas`.
   Round to 4 decimals. Sort by spend desc.

Add `adsReportSchema` to `src/lib/schema.ts` and include it in
`reportTypeSchema`; add `'ads'` to `reportTypeParam`.

## 9. UI

### 9.1 Report page `src/app/(main)/websites/[websiteId]/(reports)/ads/`

Mirror the `utm` folder: `page.tsx` (server, `metadata.title = 'Ads'`),
`AdsPage.tsx` (client: `WebsiteControls`, `useDateRange`, currency from
`getItem(CURRENCY_CONFIG) || process.env.defaultCurrency || DEFAULT_CURRENCY`
as in `revenue/Revenue.tsx`), `Ads.tsx` (calls
`useResultQuery<AdsReportResult>('ads', { websiteId, startDate, endDate, currency })`).

Layout: a `MetricsBar`-style row of totals (spend, clicks, visits, revenue,
ROAS) then a `DataTable` of rows with provider, campaign, spend, impressions,
clicks, conversions, visits, revenue, CPC, cost/visit, ROAS. Format money
with `formatCurrency` from `src/lib/format.ts`. Show a warning banner when
`excludedCurrencies.length > 0` and an empty state with a link to settings
when `integrations.length === 0`. Show per-integration sync errors inline.

### 9.2 Wiring

- `src/components/hooks/useWebsiteNavItems.tsx`: add `{ id: 'ads', label: t(labels.ads), icon: <Megaphone />, path: renderPath('/ads') }` to the growth group. Use an existing icon from `@/components/icons` (lucide re-exports) if `Megaphone` is not exported; do not add an SVG asset.
- `src/permissions/share.ts`: add `'ads'` to `ShareSection` and `SHARE_SECTIONS`.
- `src/permissions/report.ts` `getReportSection`: add `case 'ads'`.
- `src/app/(main)/websites/[websiteId]/settings/constants.ts`: add `{ id: 'ads', label: 'ads' }` under growth.
- `src/components/messages.ts`: add `ads`, `adsDescription`, `adSpend`, `adIntegrations`, `connect`, `sync`, `lastSynced`, `matchMode`, `importSpend`, `adAccount`, and the column labels. Add the English strings to `public/intl/messages/en-US.json`, then run `node scripts/check-missing-messages.js` to propagate placeholders.
- Board component is a follow-up; do not touch `boardComponentRegistry.tsx`.

### 9.3 Settings panel

New `src/app/(main)/websites/[websiteId]/settings/WebsiteAdIntegrations.tsx`
rendered as another `<Panel>` in `WebsiteSettings.tsx`, hidden when
`useConfig().adIntegrationsEnabled` is false. Contents:

- List of integrations: provider, account name, currency, match mode,
  last sync time, status/error, buttons **Sync now**, **Edit**, **Delete**.
- **Connect** buttons for each provider in `adProviders`. Click →
  `GET /api/ad-integrations/{provider}/authorize?websiteId=` → `window.location = url`.
- After return with `?integration=` in the URL: open an account picker that
  loads `.../accounts`, saves `accountId/accountName/currency` via
  `POST .../[integrationId]`, then triggers `sync`.
- Edit form: match mode select (`platform`, `campaignName`, `campaignId`)
  with the tracking-template hint text for the chosen provider.
- **Add manual source** creates a `manual` integration; its row has an
  **Import CSV** button that parses `date,campaign_id,campaign_name,currency,spend,impressions,clicks,conversions,conversion_value`
  in the browser (no new dependency; split on lines and commas, no quoted
  fields in MVP) and posts to `.../spend` in chunks of 1000.

Hooks: `src/components/hooks/queries/useAdIntegrationsQuery.ts` following
`useWebsiteAnnotationsQuery.ts`; mutations via `useApi().post/del`.

## 10. Phases and order of work

Complete each phase, run the checks in section 11, commit, then move on.

1. **Schema and queries**: migration, Prisma models, `src/queries/prisma/adIntegration.ts`, `adSpend.ts`, unit tests for `upsertAdSpend` batching and `claimAdIntegrationSync`.
2. **Report without providers**: `getAdCampaignMetrics.ts`, `getAdsReport.ts`, schema entries, `/api/reports/ads`, share/nav/messages wiring, report page. Seed `ad_spend` rows by SQL to test. Ship the manual integration routes (7.1, 7.2, 7.4) and the settings panel with only the manual source in this phase so the feature is useful before any OAuth exists.
3. **Provider layer and sync**: `src/lib/ads/*`, `sync.ts`, sync route, stale-sync call in the report route, config flags.
4. **Google Ads**: adapter, OAuth routes, account picker, tracking-template hint.
5. **Meta**: adapter, token refresh path.
6. **Polish**: OpenAPI contracts, README env-var docs, `check-missing-messages`, e2e smoke test for the report page empty state.

## 11. Verification (run before every commit)

```bash
pnpm install
pnpm build-db-client          # after schema changes
pnpm lint
pnpm check                    # biome format + lint, writes fixes
pnpm test                     # vitest, includes new unit tests
pnpm openapi:contracts && pnpm openapi:check
```

For provider adapters write unit tests that stub `fetch` with recorded
JSON fixtures under `src/lib/ads/__fixtures__/` (one Google `searchStream`
page, one Meta insights page with `paging.next`). Assert micro conversion,
pagination, and that thrown errors contain no token strings.

Manual check with Postgres: create a manual integration, import a small CSV,
open `/websites/<id>/ads` with a matching `utm_campaign` in seeded events
(`pnpm seed-data` can generate events; set `utm_campaign` on a few rows by
SQL) and confirm visits and revenue land on the right row.

## 12. Non-goals for this plan

- FX conversion between currencies.
- Ad group, ad set, ad and keyword level breakdowns.
- Goal-based conversion counts in the report.
- Board component, share-page rendering beyond the permission flag.
- Microsoft, LinkedIn, TikTok adapters (interface must allow them).
- An in-process scheduler. External cron hitting the sync route is the
  documented self-hosted option.

## 13. Platform prerequisites (outside the code, start early)

- Google: a Google Cloud project with an OAuth client, the `adwords` scope
  verified for publishing, and a developer token. New tokens start at Test
  or Explorer access; apply for Basic Access (about 5 business days) to lift
  the daily operation cap. Standard Access needs demo sign-in for tools
  serving external users.
- Meta: an app with `ads_read`, App Review and Business Verification for
  Advanced Access. The Marketing API Access Tier upper level requires 500
  successful calls in the trailing 15 days.
