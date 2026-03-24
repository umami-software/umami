# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24-alpine
ARG PNPM_VERSION=10.32.1

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY package.json ./
# 如果你们有这些文件，也要一起 copy，避免依赖层失真
# COPY .npmrc pnpm-workspace.yaml ./
# COPY patches ./patches

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install 

FROM base AS builder
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY docker/middleware.ts ./src/middleware.ts

ARG BASE_PATH
ENV NODE_ENV=production

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    BASE_PATH="${BASE_PATH}" \
    DATABASE_URL="postgresql://user:pass@localhost:5432/dummy" \
    pnpm run build-docker

FROM base AS runner
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# 用官方 node 镜像自带的 node 用户即可，少一层自建用户逻辑
COPY --from=builder --chown=node:node /app/public ./public

# Next 运行时缓存/ISR 目录
RUN mkdir .next && chown node:node .next

# standalone 最小运行集
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# 只有当运行时真的需要这些文件时才复制
# COPY --from=builder --chown=node:node /app/prisma ./prisma
# COPY --from=builder --chown=node:node /app/generated ./generated
# COPY --from=builder --chown=node:node /app/scripts ./scripts

USER node
EXPOSE 3000

CMD ["node", "server.js"]
