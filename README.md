<p align="center">
  <img src="https://content.umami.is/website/images/umami-logo.png" alt="Umami Logo" width="100">
</p>

<h1 align="center">Umami</h1>

<p align="center">
  <i>Umami is a simple, fast, privacy-focused alternative to Google Analytics.</i>
</p>

<p align="center">
  <a href="https://github.com/umami-software/umami/releases"><img src="https://img.shields.io/github/release/umami-software/umami.svg" alt="GitHub Release" /></a>
  <a href="https://github.com/umami-software/umami/blob/master/LICENSE"><img src="https://img.shields.io/github/license/umami-software/umami.svg" alt="MIT License" /></a>
  <a href="https://github.com/umami-software/umami/actions"><img src="https://img.shields.io/github/actions/workflow/status/umami-software/umami/ci.yml" alt="Build Status" /></a>
  <a href="https://analytics.umami.is/share/LGazGOecbDtaIwDr/umami.is" style="text-decoration: none;"><img src="https://img.shields.io/badge/Try%20Demo%20Now-Click%20Here-brightgreen" alt="Umami Demo" /></a>
</p>

---

## 🚀 Getting Started

A detailed getting started guide can be found at [umami.is/docs](https://umami.is/docs/).

---

## 🛠 Installing from Source

### Requirements

- A server with Node.js version 18.18 or newer
- A database. Umami supports [PostgreSQL](https://www.postgresql.org/) (minimum v12.14) databases.

### Get the Source Code and Install Packages

```bash
git clone https://github.com/umami-software/umami.git
cd umami
pnpm install
```

### Configure Umami

Create an `.env` file with the following:

```bash
DATABASE_URL=connection-url
```

The connection URL format:

```bash
postgresql://username:mypassword@localhost:5432/mydb
```

### Build the Application

```bash
pnpm run build
```

_The build step will create tables in your database if you are installing for the first time. It will also create a login user with username **admin** and password **umami**._

### Start the Application

```bash
pnpm run start
```

_By default, this will launch the application on `http://localhost:3000`. You will need to either [proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) requests from your web server or change the [port](https://nextjs.org/docs/api-reference/cli#production) to serve the application directly._

---

## 🐳 Installing with Docker

To build the Umami container and start up a Postgres database, run:

```bash
docker compose up -d
```

Alternatively, to pull just the Umami Docker image with PostgreSQL support:

```bash
docker pull docker.umami.is/umami-software/umami:latest
```

---

## 🔄 Getting Updates
> [!WARNING]  
> If you are updating from Umami V2, image "postgresql-latest" is deprecated. You must change it to "latest".
> e.g., rename `docker.umami.is/umami-software/umami:postgresql-latest` to `docker.umami.is/umami-software/umami:latest`.

To get the latest features, simply do a pull, install any new dependencies, and rebuild:

```bash
git pull
pnpm install
pnpm run build
```

To update the Docker image, simply pull the new images and rebuild:

```bash
docker compose pull
docker compose up --force-recreate -d
```

---
## Database ERD
```mermaid
erDiagram

    WEBSITE_EVENT {
        uuid website_id
        uuid session_id
        uuid visit_id
        uuid event_id

        string hostname
        string browser
        string os
        string device
        string screen
        string language
        string country
        string region
        string city

        string url_path
        string url_query
        string utm_source
        string utm_medium
        string utm_campaign
        string utm_content
        string utm_term
        string referrer_path
        string referrer_query
        string referrer_domain
        string page_title

        string gclid
        string fbclid
        string msclkid
        string ttclid
        string li_fat_id
        string twclid

        uint event_type
        string event_name
        string tag
        string distinct_id

        datetime created_at
        uuid job_id
    }

    EVENT_DATA {
        uuid website_id
        uuid session_id
        uuid event_id

        string url_path
        string event_name
        string data_key

        string string_value
        decimal number_value
        datetime date_value

        uint data_type
        datetime created_at
        uuid job_id
    }

    SESSION_DATA {
        uuid website_id
        uuid session_id

        string data_key
        string string_value
        decimal number_value
        datetime date_value

        uint data_type
        string distinct_id
        datetime created_at
        uuid job_id
    }

    WEBSITE_EVENT_STATS_HOURLY {
        uuid website_id
        uuid session_id
        uuid visit_id

        string[] hostname
        string browser
        string os
        string device
        string screen
        string language
        string country
        string region
        string city

        string entry_url
        string exit_url

        string[] url_path
        string[] url_query
        string[] utm_source
        string[] utm_medium
        string[] utm_campaign
        string[] utm_content
        string[] utm_term
        string[] referrer_domain
        string[] page_title
        string[] gclid
        string[] fbclid
        string[] msclkid
        string[] ttclid
        string[] li_fat_id
        string[] twclid

        uint event_type
        string[] event_name
        uint views
        datetime min_time
        datetime max_time
        string[] tag
        string distinct_id

        datetime created_at
    }

    WEBSITE_REVENUE {
        uuid website_id
        uuid session_id
        uuid event_id

        string event_name
        string currency
        decimal revenue

        datetime created_at
    }

    %% RELATIONSHIPS

    %% One website_event can have many event_data rows (KV payload for events)
    WEBSITE_EVENT ||--o{ EVENT_DATA : "has event data"

    %% One session (via website_event) can have many session_data rows (session-level KV)
    WEBSITE_EVENT ||--o{ SESSION_DATA : "has session data"

    %% Hourly stats are aggregated from raw events
    WEBSITE_EVENT ||--o{ WEBSITE_EVENT_STATS_HOURLY : "aggregated into"

    %% Revenue is per event
    WEBSITE_EVENT ||--o{ WEBSITE_REVENUE : "has revenue"

    %% Revenue rows are derived from a subset of event_data rows
    EVENT_DATA ||--o{ WEBSITE_REVENUE : "revenue from"

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
