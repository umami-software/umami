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
- A database. Umami supports [MariaDB](https://www.mariadb.org/) (minimum v10.5), [MySQL](https://www.mysql.com/) (minimum v8.0) and [PostgreSQL](https://www.postgresql.org/) (minimum v12.14) databases.

### Install Yarn

```bash
npm install -g yarn
```

### Get the Source Code and Install Packages

```bash
git clone https://github.com/umami-software/umami.git
cd umami
yarn install
```

### Configure Umami

Create an `.env` file with the following:

```bash
DATABASE_URL=connection-url
```

The connection URL format:

```bash
postgresql://username:mypassword@localhost:5432/mydb
mysql://username:mypassword@localhost:3306/mydb
```

### Build the Application

```bash
yarn build
```

*The build step will create tables in your database if you are installing for the first time. It will also create a login user with username **admin** and password **umami**.*

### Start the Application

```bash
yarn start
```

*By default, this will launch the application on `http://localhost:3000`. You will need to either [proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) requests from your web server or change the [port](https://nextjs.org/docs/api-reference/cli#production) to serve the application directly.*

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

Or with MySQL support:

```bash
docker pull docker.umami.is/umami-software/umami:mysql-latest
```

---

## 🔄 Getting Updates

To get the latest features, simply do a pull, install any new dependencies, and rebuild:

```bash
git pull
yarn install
yarn build
```

To update the Docker image, simply pull the new images and rebuild:

```bash
docker compose pull
docker compose up --force-recreate -d
```

---

## 🛟 Support

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
