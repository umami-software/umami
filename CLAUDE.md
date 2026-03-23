# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Dev server:** `npm run dev` (port 3001, Turbo)
- **Build:** `npm run build` (runs check-env → build-db → check-db → build-tracker → build-geo → build-app)
- **Prisma generate:** `npx prisma generate` (must run before dev if `@/generated/prisma/client` is missing)
- **DB migrations:** `npm run update-db`
- **Lint/Format:** `npm run lint` / `npm run format` / `npm run check` (all use Biome)
- **Tests:** `npm test` (Jest), `npm run cypress-open` (Cypress E2E)
- **Install deps:** `npm install --legacy-peer-deps` (needed due to React 19 peer dep conflicts)

## Architecture

### Database Dual Support

The app supports both PostgreSQL (via Prisma) and ClickHouse for analytics. `src/lib/db.ts` routes queries via `runQuery()`:

```ts
runQuery({
  [PRISMA]: () => relationalQuery(...),
  [CLICKHOUSE]: () => clickhouseQuery(...),
});
```

- **Prisma queries** (`src/queries/prisma/`): CRUD operations for User, Team, Website, Link, etc.
- **SQL queries** (`src/queries/sql/`): Analytics queries (events, sessions, pageviews, reports) with implementations for both PostgreSQL and ClickHouse.
- **Prisma utilities** (`src/lib/prisma.ts`): `pagedQuery()` for paginated findMany, `rawQuery()` with `{{param::type}}` template syntax, `parseFilters()` for building WHERE clauses.

### API Routes

Next.js 15 App Router handlers in `src/app/api/`. Pattern:
1. Define Zod schema for request validation
2. `parseRequest(request, schema)` extracts `auth`, `query`/`body`, and `error`
3. Permission check (e.g., `canViewTeam(auth, teamId)`)
4. Query execution and `json()` response

Response helpers from `src/lib/response.ts`: `json()`, `error()`, `unauthorized()`, `badRequest()`.

### App Route Groups

- `(main)` — Authenticated app pages (dashboards, websites, links, teams, admin)
- `(collect)` — Event collection endpoints
- `(share)` — Public share token routes
- `(sso)` — Single sign-on

### Permission System

`src/permissions/` has role-based checks. Roles: admin, user, view-only, team-owner, team-manager, team-member, team-view-only. Permission functions are async and check entity ownership (e.g., `canViewWebsite(auth, websiteId)`).

### Internationalization

React-intl with 50+ languages in `src/lang/`. Labels defined in `src/components/messages.ts` using `defineMessages()`. Add new labels to both `messages.ts` and `src/lang/en-US.json`.

### Event Types

Defined in `src/lib/constants.ts`: pageView(1), customEvent(2), linkEvent(3), pixelEvent(4). Links and Pixels use their `id` as the `websiteId` in `website_event` for tracking.

### State Management

Zustand stores in `src/store/` (app, cache, dashboard, version, websites). Data fetching via React Query hooks in `src/components/hooks/queries/`.

### Tracker

Standalone analytics script bundled with Rollup (`src/tracker/`). Built separately via `build-tracker`.

## Key Configuration

- **TypeScript:** Path alias `@/*` → `./src/*`, strict mode, ES2022 target
- **Biome:** 100 char line width, 2-space indent, single quotes, trailing commas
- **Next.js:** Standalone output, security headers, rewrites for tracker script
- **Prisma schema:** `prisma/schema.prisma`, config in `prisma.config.ts`
- **Docker:** `Dockerfile` uses pnpm with `pnpm-lock.yaml`

## Fork Info

- **Always check for upstream updates** at the start of a session with `git fetch upstream && git log --oneline master..upstream/master`
