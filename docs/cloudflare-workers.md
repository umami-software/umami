# Cloudflare Workers setup (Framian fork)

This fork runs Umami on Cloudflare Workers with OpenNext and Hyperdrive.

## Current deployment targets

- Production worker: `headlify-umami`
- Staging worker: `headlify-umami-staging`
- Hyperdrive binding name: `HYPERDRIVE`

## Required fork-specific files

- `wrangler.jsonc`: worker name, envs, Hyperdrive binding, assets and wasm rules.
- `open-next.config.ts`: uses `pnpm build:worker:prep` as OpenNext build command.
- `next.config.ts`:
  - `serverExternalPackages`: `@prisma/client`, `.prisma/client`, `pg-cloudflare`
  - worker build helpers (`outputFileTracingIncludes`, prisma adapter packages, wasm webpack config)
- `prisma/schema.prisma`:
  - keeps Umami's generated client (`provider = "prisma-client"`, `runtime = "workerd"`)
  - adds `generator client_js { provider = "prisma-client-js" }` for runtime `@prisma/client`
- `src/lib/prisma.ts`:
  - runtime Prisma uses `@prisma/client` + `@prisma/adapter-pg`
  - resolves connection string from `getCloudflareContext().env.HYPERDRIVE.connectionString`
  - avoids global Prisma reuse when request-scoped Hyperdrive string is present
- `scripts/patch-turbopack-wasm-runtime.js`:
  - patches Turbopack wasm loader in both `.next/...` and `.open-next/...`
- `package.json` worker scripts:
  - `build:worker:prep`
  - `build:worker`
  - `deploy:worker`, `deploy:worker:staging`, `deploy:worker:prod`

## Deploy commands

```bash
# Staging
pnpm run deploy:worker:staging

# Production
pnpm run deploy:worker:prod
```

## Post-deploy smoke test

```bash
curl -sS https://<worker-domain>/api/heartbeat
# expected: {"ok":true}

curl -sS -X POST \
  -H 'content-type: application/json' \
  -d '{"username":"invalid","password":"invalid"}' \
  https://<worker-domain>/api/auth/login
# expected: 401 with incorrect-username-password
```

## Headlify internal provisioning

This fork exposes a Headlify-only endpoint for tenant analytics ownership provisioning:

- `POST /api/internal/headlify/provision`
- protected with `Authorization: Bearer <HEADLIFY_UMAMI_INTERNAL_SECRET>`
- used by Headlify spawner to ensure/reuse one Umami user per Headlify email and one Umami website per tenant domain

Required worker secret:

- `HEADLIFY_UMAMI_INTERNAL_SECRET`

Operational rules:

- normalize Headlify email to Umami `username`
- create missing Umami users with random password + role `user`
- reuse existing websites by domain
- transfer legacy website ownership to the resolved user when domain already exists under another owner

## Upgrade checklist (when syncing from upstream Umami)

1. Pull/merge upstream changes.
2. Re-apply and verify this fork's Cloudflare files:
   - `wrangler.jsonc`
   - `open-next.config.ts`
   - `scripts/patch-turbopack-wasm-runtime.js`
3. Re-check `package.json` worker scripts and dependencies (`@opennextjs/cloudflare`, `wrangler`, `pg-cloudflare`, `@prisma/adapter-pg`).
4. Re-check `next.config.ts` Prisma/Workers settings.
5. Re-check `prisma/schema.prisma` generators (`client` + `client_js`).
6. Re-check `src/lib/prisma.ts`:
   - Hyperdrive lookup
   - request-scoped Prisma handling for Workers
7. Deploy staging and run smoke tests.
8. Deploy production only after staging smoke tests pass.

## Notes

- This setup is intentionally different from upstream Umami's default Node deployment.
- Keep Cloudflare-specific changes isolated to the files above to make future rebases easier.
