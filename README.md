<p align="center">
  <img src="https://content.umami.is/website/images/umami-logo.png" alt="Umami Logo" width="100">
</p>

<h1 align="center">Umami</h1>

<p align="center">
  <i>Umami is a simple, fast, privacy-focused alternative to Google Analytics.</i>
</p>

<p align="center">
  <a href="https://github.com/umami-software/umami/releases">
    <img src="https://img.shields.io/github/release/umami-software/umami.svg" alt="GitHub Release" />
  </a>
  <a href="https://github.com/umami-software/umami/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/umami-software/umami.svg" alt="MIT License" />
  </a>
  <a href="https://github.com/umami-software/umami/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/umami-software/umami/ci.yml" alt="Build Status" />
  </a>
  <a href="https://analytics.umami.is/share/LGazGOecbDtaIwDr/umami.is" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Try%20Demo%20Now-Click%20Here-brightgreen" alt="Umami Demo" />
  </a>
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
docker pull docker.umami.is/umami-software/umami:postgresql-latest
```

---

## 🔄 Getting Updates

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

## 🎯 First8 Marketing Integration

This is a customized version of Umami Analytics integrated into the **First8 Marketing Hyper-Personalized System**. This implementation extends the standard Umami installation with:

### Enhanced Features

- **PostgreSQL 17 with Apache AGE** - Graph database capabilities for advanced relationship tracking
- **TimescaleDB Integration** - Time-series optimization for analytics data
- **Extended Event Tracking** - Comprehensive WordPress and WooCommerce event capture
- **Real-time Data Pipeline** - ETL integration with the recommendation engine
- **Multi-dimensional Analytics** - Contextual, behavioral, temporal, and journey tracking

### System Architecture

This Umami instance serves as the **data collection layer** for the First8 Marketing hyper-personalization system:

```
WordPress Site → Umami Analytics → Recommendation Engine → Personalized Content
```

**Data Flow:**
1. **Collection**: Umami captures all user interactions, page views, and WooCommerce events
2. **Storage**: Events stored in PostgreSQL with TimescaleDB for time-series optimization
3. **Graph Analysis**: Apache AGE enables relationship mapping between users, products, and behaviors
4. **ETL Pipeline**: Real-time synchronization with the recommendation engine
5. **Personalization**: ML models use analytics data to generate hyper-personalized recommendations

### Integration Components

This Umami installation works in conjunction with:

- **First8 Marketing Track Plugin** - WordPress connector for seamless event tracking
- **Recommendation Engine** - Proprietary ML-powered personalization backend
- **First8 Marketing Recommendation Engine Plugin** - WordPress connector for displaying personalized content

### Database Enhancements

**PostgreSQL Extensions:**
- **Apache AGE 1.6.0** - Graph database for relationship mapping
- **TimescaleDB 2.23.0** - Time-series optimization for analytics queries
- **Prisma 6.18.0** - ORM for database management

**Custom Schema Extensions:**
- User journey tracking tables
- Product interaction graphs
- Session behavior analysis
- Purchase pattern storage

### Configuration for First8 Marketing

**Environment Variables:**
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/umami
NODE_ENV=production
PORT=3000
```

**Required PostgreSQL Version:** 17.x (for Apache AGE compatibility)

### Usage in First8 Marketing System

**Event Tracking:**
- All WordPress core events (page views, clicks, form submissions)
- WooCommerce events (product views, add to cart, purchases, checkout steps)
- Custom events via First8 Marketing Track plugin
- User journey and session tracking

**Data Access:**
- Real-time analytics dashboard via Umami UI
- ETL pipeline for recommendation engine
- Graph queries via Apache AGE for relationship analysis
- Time-series queries via TimescaleDB for trend analysis

### Deployment Notes

This instance is configured for standalone deployment with:
- PostgreSQL 17 database server
- Apache AGE graph extension
- TimescaleDB time-series extension
- Node.js 18.18+ runtime
- Reverse proxy (Nginx/Apache) for production

### Credits

**Original Software:**
- **Umami Analytics** - Created by [Umami Software](https://umami.is)
- Licensed under MIT License
- Original repository: [github.com/umami-software/umami](https://github.com/umami-software/umami)

**First8 Marketing Customization:**
- **Integration & Enhancement** - First8 Marketing
- PostgreSQL 17 + Apache AGE + TimescaleDB integration
- Extended event tracking for WordPress/WooCommerce
- ETL pipeline for recommendation engine
- Custom schema extensions for hyper-personalization

---

## 🛟 Support

**Original Umami Support:**

<p align="center">
  <a href="https://github.com/umami-software/umami">
    <img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=github" alt="GitHub" />
  </a>
  <a href="https://twitter.com/umami_software">
    <img src="https://img.shields.io/badge/Twitter--blue?style=social&logo=twitter" alt="Twitter" />
  </a>
  <a href="https://linkedin.com/company/umami-software">
    <img src="https://img.shields.io/badge/LinkedIn--blue?style=social&logo=linkedin" alt="LinkedIn" />
  </a>
  <a href="https://umami.is/discord">
    <img src="https://img.shields.io/badge/Discord--blue?style=social&logo=discord" alt="Discord" />
  </a>
</p>

**First8 Marketing Integration Support:**
- For integration-specific issues, contact First8 Marketing
- For core Umami issues, use the official Umami support channels above

---

## 📄 License

This project maintains the original MIT License from Umami Software.

**Original Authors:** Umami Software
**Integration & Customization:** First8 Marketing

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
