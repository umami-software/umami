# Contributing to Umami

Thanks for your interest in contributing to Umami! This document outlines the process for contributing code.

## Branching

Umami uses the following long-lived branches:

- `master` — stable, released code. **Do not open PRs against `master`.**
- `dev` — active development. **All pull requests should target `dev`.**

Feature branches and fixes are merged into `dev`, and `dev` is periodically merged into `master` for releases.

## Submitting a Pull Request

1. Fork the repository and create your branch from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b my-feature
   ```
2. Make your changes. Keep PRs focused — one logical change per PR.
3. Ensure the project builds, tests, and lints cleanly. CI runs all of the following, so run them
   locally to avoid a red PR:
   ```bash
   pnpm install
   pnpm build
   pnpm lint
   pnpm test
   pnpm test:packages
   pnpm openapi:check --explicit
   pnpm check:api:client
   ```

   The last two guard generated code. If you changed an OpenAPI contract under `src/app/api/**`,
   run `pnpm openapi:generate` to regenerate `contract.generated.ts` and the API client, then commit
   the result. CI fails if the generated files are stale.
4. Push your branch and open a pull request **against the `dev` branch**.
5. Fill in the PR description with what changed and why. Link any related issues.

PRs opened against `master` will be asked to retarget `dev`.

## Reporting Issues

- Search [existing issues](https://github.com/umami-software/umami/issues) before opening a new one.
- For bugs, include reproduction steps, expected vs. actual behavior, and your environment (Umami version, database, browser).
- For feature requests, describe the use case before the proposed solution.

## Development Setup

The [README](./README.md) covers installing dependencies, configuring the database, and running a
production build. For day-to-day development:

```bash
pnpm install
cp .env.example .env    # then set at least DATABASE_URL and APP_SECRET
pnpm build               # required once: generates the Prisma client and applies migrations
pnpm dev                 # dev server on http://localhost:3000
```

`pnpm dev` runs `next dev` with hot reload and reads `.env` automatically — you do not need
`pnpm build` or `pnpm start` while developing. Re-run `pnpm build` after pulling changes that touch
`prisma/schema.prisma` or the generated OpenAPI client.

Tooling versions matter, because CI pins them and your local versions may differ:

- **pnpm 12.3.4** — pinned in `engines.pnpm` and used by CI.
- **Node.js 22** — used by CI. The README's stated minimum is 18.18, but CI builds on 22.

If `pnpm install` warns about an unsupported engine, upgrade pnpm rather than ignoring it.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
