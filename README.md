<p align="center">
  <img src="https://content.umami.is/website/images/umami-logo.png" alt="Umami Logo" width="100">
</p>

<h1 align="center">Umami</h1>

<p align="center">
  <i>Umami is a privacy-first analytics platform. Traffic, campaigns, behavior, conversions, and revenue in one place — no cookies, no surveillance, self-hosted or in the cloud.</i>
</p>

<p align="center">
  <a href="https://github.com/umami-software/umami/releases"><img src="https://img.shields.io/github/release/umami-software/umami.svg" alt="GitHub Release" /></a>
  <a href="https://github.com/umami-software/umami/blob/master/LICENSE"><img src="https://img.shields.io/github/license/umami-software/umami.svg" alt="MIT License" /></a>
  <a href="https://github.com/umami-software/umami/actions"><img src="https://img.shields.io/github/actions/workflow/status/umami-software/umami/ci.yml" alt="Build Status" /></a>
  <a href="https://cloud.umami.is/share/LGazGOecbDtaIwDr/umami.is" style="text-decoration: none;"><img src="https://img.shields.io/badge/Try%20Demo%20Now-Click%20Here-brightgreen" alt="Umami Demo" /></a>
</p>

---

## 🚀 Getting Started

A detailed getting started guide can be found at [umami.is/docs](https://umami.is/docs/).

---

## 🛠 Installing from Source

### Requirements

- A server with Node.js version 18.18+.
- A PostgreSQL database version v12.14+.

### Get the source code and install packages

```bash
git clone https://github.com/umami-software/umami.git
cd umami
pnpm install
```

### Configure Umami

Copy the example file and fill it in:

```bash
cp .env.example .env
```

At minimum, set these two:

```bash
DATABASE_URL=connection-url
APP_SECRET=random-string
```

`APP_SECRET` signs and encrypts session tokens. If it is not set, Umami silently falls back to
deriving the key from `DATABASE_URL` — which means anyone who knows your database connection
string can forge a session token, and changing the connection string later invalidates every
session. Generate one with `openssl rand -base64 32`. Changing it after setup will log out all
sessions; this is expected.

The connection URL format:

```bash
postgresql://username:mypassword@localhost:5432/mydb
```

#### Optional variables

`TWO_FACTOR_ENCRYPTION_KEY` — a 64-character hex string that enables two-factor authentication.
Generate one with `openssl rand -hex 32`. Two-factor authentication is unavailable and cannot be
required until this key is set.

`DIRECT_DATABASE_URL` — a direct (unpooled) connection string used for schema migrations only.
Set this when your database URL points at a connection pooler (PgBouncer, Supabase, Neon), since
migrations cannot run over a pooled connection. Normal queries keep using `DATABASE_URL`.

`REDIS_URL` — enables Redis-backed sessions, which can be revoked server-side. Without it, sessions
are stateless signed tokens and logging out cannot invalidate a token that was already issued.

`API_URL` — changes the base URL used by internal UI API calls. Relative paths are served under
`BASE_PATH`; absolute URLs are proxied through the local `/api` route. For example,
`API_URL=/internal-api` or `API_URL=https://api.example.com/api`.

`MCP_ENABLED` — set to `1` to enable the `/mcp` endpoint, then authenticate with an API key
generated under Settings → API keys. Disabled by default.

`SKIP_DB_CHECK` / `SKIP_DB_MIGRATION` — set to `1` to bypass the build-time database connectivity
check or migration step, for example in CI against a dummy URL.

`DISABLE_LOGIN` / `CLOUD_MODE` — render the login page blank. Do not set these for a normal
self-hosted install.

#### Other features

Browser error tracking is available as an opt-in website feature. See the
[error tracking guide](docs/error-tracking.md) for setup, migrations, and retention scheduling.

### Build the Application

```bash
pnpm run build
```

The build step will create tables in your database if you are installing for the first time. It will also create a login user with username **admin** and password **umami**.

Change that password immediately after the first login — it is public knowledge, so any
unmodified install is effectively open. Use Settings → Change password, or `PUT /api/me/password`.
Passwords must be at least 8 characters.

### Start the Application

```bash
pnpm run start
```

By default, this will launch the application on `http://localhost:3000`. You will need to either [proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) requests from your web server or change the [port](https://nextjs.org/docs/api-reference/cli#production) to serve the application directly.

---

## 🐳 Installing with Docker

Umami provides Docker images as well as a Docker compose file for easy deployment.

Docker image:

```bash
docker pull docker.umami.is/umami-software/umami:latest
```

Docker compose (Runs Umami with a PostgreSQL database):

```bash
docker compose up -d
```

---

## 🔄 Getting Updates

To get the latest features, simply do a pull, install any new dependencies, and rebuild:

```bash
git pull
pnpm install
pnpm build
```

To update the Docker image, simply pull the new images and rebuild:

```bash
docker compose pull
docker compose up --force-recreate -d
```

---

## 🛟 Support

<p align="center">
  <a href="https://github.com/umami-software/umami"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=github" alt="GitHub" /></a>
  <a href="https://twitter.com/umami_software"><img src="https://img.shields.io/badge/Twitter--blue?style=social&logo=twitter" alt="Twitter" /></a>
  <a href="https://linkedin.com/company/umami-software"><img src="https://img.shields.io/badge/LinkedIn--blue?style=social&logo=linkedin" alt="LinkedIn" /></a>
  <a href="https://umami.is/discord"><img src="https://img.shields.io/badge/Discord--blue?style=social&logo=discord" alt="Discord" /></a>
</p>

[release-shield]: https://img.shields.io/github/release/umami-software/umami.svg
[releases-url]: https://github.com/umami-software/umami/releases
[license-shield]: https://img.shields.io/github/license/umami-software/umami.svg
[license-url]: https://github.com/umami-software/umami/blob/master/LICENSE
[build-shield]: https://img.shields.io/github/actions/workflow/status/umami-software/umami/ci.yml
[build-url]: https://github.com/umami-software/umami/actions
[github-shield]: https://img.shields.io/badge/GitHub--blue?style=social&logo=github
[github-url]: https://github.com/umami-software/umami
[twitter-shield]: https://img.shields.io/badge/Twitter--blue?style=social&logo=twitter
[twitter-url]: https://twitter.com/umami_software
[linkedin-shield]: https://img.shields.io/badge/LinkedIn--blue?style=social&logo=linkedin
[linkedin-url]: https://linkedin.com/company/umami-software
[discord-shield]: https://img.shields.io/badge/Discord--blue?style=social&logo=discord
[discord-url]: https://discord.com/invite/4dz4zcXYrQ
