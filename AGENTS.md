# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Project overview

Umami is a privacy-focused web analytics platform built with Next.js 15, React 19, and TypeScript.

- Primary database: PostgreSQL
- Optional analytics backend: ClickHouse
- Optional cache/session backend: Redis

## Development rules

- Assume a dev server is already running on port `3001`.
- Do **not** start another dev server.
- Use `pnpm` (not `npm` or `yarn`).
- Avoid destructive shell commands unless explicitly requested.
- Ask before running `git commit` or `git push`.

## Common commands

```bash
# Development
pnpm dev
pnpm build
pnpm start

# Database
pnpm build-db
pnpm update-db
pnpm check-db
pnpm seed-data

# Code quality
pnpm lint
pnpm format
pnpm check
pnpm test

# Build specific parts
pnpm build-tracker
pnpm build-geo
```

## Architecture

- `src/app/`: Next.js App Router routes and API endpoints
- `src/components/`: UI components and hooks
- `src/lib/`: shared utilities and infrastructure helpers
- `src/queries/`: data access layer (Prisma + raw SQL)
- `src/store/`: Zustand stores
- `src/tracker/`: standalone client tracking script
- `prisma/`: schema and migrations

## Key implementation patterns

### API request validation

Use Zod + `parseRequest` in API handlers:

```ts
const schema = z.object({ /* fields */ });
const { body, error } = await parseRequest(request, schema);
if (error) return error();
```

### Authentication

- JWT via `Authorization: Bearer <token>`
- Share token via `x-umami-share-token`
- Role model: `admin`, `manager`, `user`

### Client data fetching

- React Query defaults: `staleTime` 60s, no retry, no refetch on window focus

### Styling

- CSS Modules with CSS variables and theme support

## Environment variables

Common env vars:

- `DATABASE_URL`
- `APP_SECRET`
- `CLICKHOUSE_URL`
- `REDIS_URL`
- `BASE_PATH`
- `DEBUG`

## Runtime requirements

- Node.js 18.18+
- PostgreSQL 12.14+
- `pnpm`
