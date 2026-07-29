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

node scripts/check-db.js
node scripts/update-tracker.js
exec node server.js
