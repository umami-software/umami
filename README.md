<p align="center">
  <img src="https://github.com/shubhusion/umami/blob/master/src/assets/logo-white.svg" alt="Umami Logo" width="100">
</p>

# Umami

> Umami is a simple, fast, privacy-focused alternative to Google Analytics.

[![GitHub Release][release-shield]][releases-url]
[![MIT License][license-shield]][license-url]
[![Build Status][build-shield]][build-url]

## Demo

Explore Umami's features by trying out our demo installation:

[Umami Demo](https://demo.umami.is/)

Please note that the demo is provided for exploration purposes only and may not include the latest features or configurations. For a more accurate representation, consider installing Umami on your own server.

## Getting Started

A detailed getting started guide can be found at [https://umami.is/docs/](https://umami.is/docs/)

## Installing from Source

### Requirements

- A server with Node.js version 16.13 or newer
- A database. Umami supports [MySQL](https://www.mysql.com/) (minimum v8.0) and [PostgreSQL](https://www.postgresql.org/) (minimum v12.14) databases.

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

The connection URL is in the following format:

```bash
postgresql://username:mypassword@localhost:5432/mydb
mysql://username:mypassword@localhost:3306/mydb
```

### Build the Application

```bash
yarn build
```

The build step will also create tables in your database if you are installing for the first time. It will also create a login user with username **admin** and password **umami**.

### Start the Application

```bash
yarn start
```

By default, this will launch the application on `http://localhost:3000`. You will need to either [proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) requests from your web server or change the [port](https://nextjs.org/docs/api-reference/cli#production) to serve the application directly.

## Installing with Docker

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

## Getting Updates

To get the latest features, simply do a pull, install any new dependencies, and rebuild:

```bash
git pull
yarn install
yarn build
```

To update the Docker image, simply pull the new images and rebuild:

```bash
docker compose pull
docker compose up --force-recreate
```
[release-shield]: https://img.shields.io/github/release/umami-software/umami.svg
[releases-url]: https://github.com/umami-software/umami/releases
[license-shield]: https://img.shields.io/github/license/umami-software/umami.svg
[license-url]: https://github.com/umami-software/umami/blob/master/LICENSE
[build-shield]: https://img.shields.io/github/actions/workflow/status/umami-software/umami/ci.yml
[build-url]: https://github.com/umami-software/umami/actions
