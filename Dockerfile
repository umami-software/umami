ARG NODE_IMAGE_VERSION="22-alpine"
ARG PNPM_VERSION="11.21.0"
# Keep in sync with the prisma/@prisma/* versions in package.json
ARG PRISMA_VERSION="7.9.1"

# Install dependencies only when needed
FROM node:${NODE_IMAGE_VERSION} AS deps
ARG PNPM_VERSION

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@${PNPM_VERSION}

RUN printf 'strictDepBuilds: false\n' > pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:${NODE_IMAGE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY docker/proxy.ts ./src

ARG BASE_PATH

ENV BASE_PATH=$BASE_PATH
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummy"

RUN npm run build-docker

# Production image, copy all the files and run next
FROM node:${NODE_IMAGE_VERSION} AS runner
WORKDIR /app

ARG NODE_OPTIONS
ARG PNPM_VERSION
ARG PRISMA_VERSION

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=$NODE_OPTIONS

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
# Bootstrap pnpm with the bundled npm, then remove npm in the same layer so the
# vulnerable packages vendored inside the npm CLI are not shipped in the final
# image. pnpm is the only package manager needed at build and runtime.
RUN set -x \
    && apk add --no-cache curl libc6-compat \
    && npm install -g pnpm@${PNPM_VERSION} \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

RUN echo {} > package.json

RUN printf "allowBuilds:\n  '@prisma/engines': true\n  prisma: false\nverifyDepsBeforeRun: false\n" > pnpm-workspace.yaml

# Script dependencies
RUN pnpm add npm-run-all dotenv chalk semver \
    prisma@${PRISMA_VERSION} \
    @prisma/client@${PRISMA_VERSION} \
    @prisma/adapter-pg@${PRISMA_VERSION}

# Assert the @prisma/engines postinstall actually downloaded the engine
# binaries. If pnpm blocked the build script (e.g. allowBuilds not honored by
# the installed pnpm version), prisma would try to download engines at runtime
# as the non-root user and fail with a permissions error.
RUN ls node_modules/.pnpm/@prisma+engines@${PRISMA_VERSION}/node_modules/@prisma/engines/*engine* \
    || (echo "ERROR: Prisma engine binaries missing - @prisma/engines postinstall was blocked" && exit 1)

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/generated ./generated

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV HOSTNAME=0.0.0.0
ENV PORT=3000

CMD ["sh", "scripts/start-docker.sh"]
