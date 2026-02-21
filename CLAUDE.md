# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Umami is a privacy-focused web analytics platform built with Next.js 15, React 19, and TypeScript. It serves as an alternative to Google Analytics, storing data in PostgreSQL (primary) with optional ClickHouse for time-series analytics.

## Development

Assume a dev server is always running on port 3001. Do not start the dev server.

## Common Commands

```bash
# Development
npm run dev              # Start dev server on port 3001 with Turbopack
npm run build            # Full production build (includes db setup, tracker, geo data)
npm run start            # Start production server

# Database
npm run build-db         # Generate Prisma client
npm run update-db        # Run Prisma migrations
npm run check-db         # Verify database connection
npm run seed-data        # Seed test data

# Code Quality
npm run lint             # Lint with Biome
npm run format           # Format with Biome
npm run check            # Format and lint with Biome
npm run test             # Run Jest tests

# Building specific parts
npm run build-tracker    # Build client-side tracking script (Rollup)
npm run build-geo        # Build geolocation database
```

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router (routes and API endpoints)
  - `(main)/` - Authenticated app routes (dashboard, websites, teams, boards, etc.)
  - `(collect)/` - Data collection routes
  - `api/` - REST API endpoints
- `src/components/` - React components (charts, forms, common UI, hooks)
- `src/lib/` - Core utilities (auth, crypto, date, prisma helpers, redis)
- `src/queries/` - Data access layer (Prisma queries and raw SQL)
- `src/store/` - Zustand state stores (app, dashboard, websites, cache)
- `src/tracker/` - Client-side tracking script (lightweight IIFE)
- `prisma/` - Database schema and migrations

### Key Patterns

**API Request Handling** - All API endpoints use Zod validation with `parseRequest`:
```typescript
const schema = z.object({ /* fields */ });
const { body, error } = await parseRequest(request, schema);
if (error) return error();
```

**Authentication** - JWT tokens via Bearer header, share tokens via `x-umami-share-token` header for public dashboards. Role-based access: admin, manager, user.

**Data Fetching** - React Query with 60s stale time, no retry, no refetch on window focus.

**State Management** - Zustand for client state, localStorage for user preferences.

**Styling** - CSS Modules with CSS variables for theming (light/dark mode).

### Database

- **ORM**: Prisma 7.x with PostgreSQL adapter
- **Schema**: `prisma/schema.prisma` - 14 models (User, Team, Website, Session, WebsiteEvent, EventData, etc.)
- **Query helpers**: `src/lib/prisma.ts` has dynamic SQL generation functions (`getDateSQL`, `mapFilter`, `getSearchSQL`)
- **Raw SQL**: Complex analytics queries use `{{param}}` template placeholders for safe binding

### Tracker Script

The tracking script in `src/tracker/index.js` is a standalone IIFE (~3-4KB) built with Rollup. It sends events to `/api/send`. Alternative script names can be configured via `TRACKER_SCRIPT_NAME` env var.

## Environment Variables

Key variables in `.env`:
```
DATABASE_URL              # PostgreSQL connection string (required)
APP_SECRET                # Encryption/signing secret
CLICKHOUSE_URL            # Optional ClickHouse for analytics
REDIS_URL                 # Optional Redis for caching/sessions
BASE_PATH                 # App base path (e.g., /analytics)
DEBUG                     # Debug namespaces (e.g., umami:*)
```

## Requirements

- Node.js 18.18+
- PostgreSQL 12.14+
- pnpm (package manager)

## Git Workflow

Always ask for confirmation before running `git commit` or `git push`.
