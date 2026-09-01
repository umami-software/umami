# OpenAPI contracts

Umami generates `public/openapi.json` from Zod-backed contracts colocated with App Router API
handlers.

## Commands

- `pnpm openapi:generate` regenerates the public OpenAPI document.
- `pnpm openapi:check` validates contract alignment and checks that the generated file is current.
- `pnpm openapi:check --strict` also fails while any non-OPTIONS API route lacks an explicit
  contract.
- `pnpm openapi:check --verbose` lists routes that still need contracts.

The normal and Docker builds run the generator before the Next.js build. CI runs the check before
tests and build steps.

## Adding an operation

Create a `contract.ts` next to the matching `route.ts` and export an `operations` array. Define
request and response shapes with Zod, and import the same request schema into the route handler for
`parseRequest` validation.

Contract modules must remain safe to import from a build script. They must not import route
handlers, database clients, Redis clients, or modules with environment-dependent side effects.

Every operation declares an audience:

- `public` operations are emitted to `public/openapi.json`.
- `internal` operations are available when building an unfiltered document.
- `collect` operations identify tracker ingestion APIs.

Route paths and HTTP methods are discovered independently from `src/app/api/**/route.ts`. The check
rejects duplicate contracts, duplicate operation IDs, orphaned contracts, and mismatched dynamic
path parameters.
