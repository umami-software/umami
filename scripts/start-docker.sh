#!/bin/sh
# Container startup: run the one-shot DB check/migration and tracker update, then
# exec the long-running server so it replaces this shell as PID 1.
#
# This avoids `npm-run-all` keeping idle `npm`/`npm-run-all` parent processes
# resident for the lifetime of the container (each a full Node VM holding tens
# of MiB of anonymous memory). `exec` leaves a single `node server.js` process.
#
# PATH is extended so check-db.js's `prisma migrate deploy` resolves the prisma
# CLI from node_modules/.bin the way `npm run` would have injected it.
set -e
export PATH="$PWD/node_modules/.bin:$PATH"

# Next's standalone server.js binds to $HOSTNAME, but that name is also owned
# by the container runtime. Some orchestrators (e.g. Podman pods) set it to
# the pod's own hostname, which can land in this script's environment
# unintended, causing the server to bind to one container IP instead of all
# interfaces. Recompute it here, right before exec, from our own UMAMI_HOST
# (for an intentional override) so it always wins over whatever the runtime
# injected.
export HOSTNAME="${UMAMI_HOST:-0.0.0.0}"

node scripts/check-db.js
node scripts/update-tracker.js
exec node server.js
