# OpenAPI contracts

Umami generates `public/openapi.json` for every App Router API handler. It statically infers a
baseline contract from route source and replaces that baseline with a colocated, Zod-backed
contract wherever one exists.

## Commands

- `pnpm openapi:generate` regenerates the public OpenAPI document.
- `pnpm openapi:contracts` refreshes source-controlled contracts for routes without a curated
  `contract.ts` module.
- `pnpm openapi:check` validates contract alignment and checks that the generated file is current.
- `pnpm openapi:check --explicit` also fails while any non-OPTIONS API route lacks a hand-authored
  contract.
- `pnpm openapi:check --verbose` lists operations that still use inferred contracts.

The normal and Docker builds run the generator before the Next.js build. CI runs the check before
tests and build steps.

## Adding an operation

Run `pnpm openapi:contracts` to create a `contract.generated.ts` next to every route that does not
have a curated contract. Generated contracts use the route's Zod request validation and TypeScript
response types. They are checked in so operation IDs and client-facing schemas remain stable.

For curated descriptions, examples, or runtime-shared Zod response models, replace the generated
module with a `contract.ts` that exports an `operations` array. Define request and response shapes
with Zod, and import the same request schema into the route handler for `parseRequest` validation.

Contract modules must remain safe to import from a build script. They must not import route
handlers, database clients, Redis clients, or modules with environment-dependent side effects.

The generated artifact contains all audiences. Every operation declares one of:

- `public` operations are intended for API consumers.
- `internal` operations support the Umami application or deployment.
- `collect` operations identify tracker ingestion APIs.

Route paths and HTTP methods are discovered independently from `src/app/api/**/route.ts`. The check
requires all discovered non-OPTIONS operations in the artifact and rejects duplicate contracts,
duplicate operation IDs, orphaned contracts, and mismatched dynamic path parameters.

New operations are initially marked with `x-umami-contract: inferred` and their source file. The
inference layer extracts path parameters, Zod request fields, authentication, typed response bodies,
response status helpers, and response media types without importing route modules. Running
`pnpm openapi:contracts` snapshots that behavior into an explicit contract. Curated `contract.ts`
modules remain the way to add examples, custom operation IDs, and hand-written prose.
