# Install dependencies only when needed
FROM node:18-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache --allow-untrusted --repository http://dl-cdn.alpinelinux.org/alpine/v3.18/main libc6-compat
RUN apk add --no-cache --allow-untrusted --repository http://dl-cdn.alpinelinux.org/alpine/v3.18/main openssl
COPY *.pem /usr/local/share/ca-certificates/
COPY *.crt /usr/local/share/ca-certificates/
RUN apk add --no-cache \    
	--allow-untrusted \
    --repository http://dl-cdn.alpinelinux.org/alpine/v3.18/main ca-certificates && rm -rf /var/cache/apk/*
RUN update-ca-certificates
WORKDIR /app
COPY package.json yarn.lock ./
COPY .yarnrc ./
COPY *.crt /usr/local/share/ca-certificates/

# Add yarn timeout to handle slow CPU when Github Actions
RUN yarn config set network-timeout 300000
RUN yarn config set enableStrictSsl false
RUN npm set strict-ssl false
RUN npm set cafile /usr/local/share/ca-certificates/Z.crt
ENV NODE_TLS_REJECT_UNAUTHORIZED 0
ENV NODE_EXTRA_CA_CERTS /usr/local/share/ca-certificates/Z.crt
ENV DOCKER_CERT_PATH "/usr/local/share/ca-certificates/Z.crt"
ENV DOCKER_TLS_VERIFY 0 
ENV PRISMA_BINARIES_MIRROR=http://binaries.prisma.sh
ENV PRISMA_ENGINES_MIRROR=http://binaries.prisma.sh
ENV NODE_OPTIONS=--use-openssl-ca
RUN npm config set strict-ssl false
RUN yarn config set "strict-ssl" false -g
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules 
COPY . .
COPY docker/middleware.js ./src
COPY *.crt /usr/local/share/ca-certificates/
COPY *.pem /usr/local/share/ca-certificates/
COPY *.crt /usr/local/share/ca-certificates/
RUN apk add --no-cache \    
	--allow-untrusted \
    --repository http://dl-cdn.alpinelinux.org/alpine/v3.18/main ca-certificates && rm -rf /var/cache/apk/*
RUN update-ca-certificates
RUN yarn config set network-timeout 300000
RUN yarn config set enableStrictSsl false
RUN npm set strict-ssl false
RUN npm set cafile /usr/local/share/ca-certificates/Z.crt
ENV NODE_TLS_REJECT_UNAUTHORIZED 0
ENV NODE_EXTRA_CA_CERTS /usr/local/share/ca-certificates/Z.crt
ENV DOCKER_CERT_PATH "/usr/local/share/ca-certificates/Z.crt"
ENV DOCKER_TLS_VERIFY 0 
ENV PRISMA_BINARIES_MIRROR=http://binaries.prisma.sh
ENV PRISMA_ENGINES_MIRROR=http://binaries.prisma.sh
ENV NODE_OPTIONS=--use-openssl-ca
ARG DATABASE_TYPE
ARG BASE_PATH

ENV DATABASE_TYPE $DATABASE_TYPE
ENV BASE_PATH $BASE_PATH

ENV NEXT_TELEMETRY_DISABLED 1

RUN yarn build-docker

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
COPY *.pem /usr/local/share/ca-certificates/
COPY *.crt /usr/local/share/ca-certificates/
RUN apk add --no-cache \    
	--allow-untrusted \
    --repository http://dl-cdn.alpinelinux.org/alpine/v3.18/main ca-certificates && rm -rf /var/cache/apk/*
RUN apk add --no-cache \    
	--allow-untrusted \
    --repository http://dl-cdn.alpinelinux.org/alpine/v3.18/main openssl
RUN update-ca-certificates

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN yarn add npm-run-all dotenv prisma

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/next.config.js .
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules 
USER nextjs

EXPOSE 3000

ENV HOSTNAME 0.0.0.0
ENV PORT 3000

CMD ["yarn", "start-docker"]
