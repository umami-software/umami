# umami

Umami is a simple, fast, privacy-focused alternative to Google Analytics.

## Getting started

A detailed getting started guide can be found at [https://umami.is/docs/](https://umami.is/docs/)

A fast way to get up and running is to use Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/umami)

See [Running on Railway](https://umami.is/docs/running-on-railway) to get started.

## Installing from source

### Requirements

- A server with Node.js 12 or newer
- A database (MySQL or Postgresql)

### Get the source code and install packages

```
git clone https://github.com/mikecao/umami.git
cd umami
npm install
```

### Create database tables

Umami supports [MySQL](https://www.mysql.com/) and [Postgresql](https://www.postgresql.org/).
Create a database for your Umami installation and install the tables with the included scripts.

For MySQL:

```
mysql -u username -p databasename < sql/schema.mysql.sql
```

For Postgresql:

```
psql -h hostname -U username -d databasename -f sql/schema.postgresql.sql
```

This will also create a login account with username **admin** and password **umami**.

### Configure umami

Create an `.env` file with the following

```
DATABASE_URL=(connection url)
HASH_SALT=(any random string)
```

The connection url is in the following format:
```
postgresql://username:mypassword@localhost:5432/mydb

mysql://username:mypassword@localhost:3306/mydb
```

The `HASH_SALT` is used to generate unique values for your installation.

### Build the application

```bash
npm run build
```

### Start the application

```bash
npm start
```

By default this will launch the application on `http://localhost:3000`. You will need to either 
[proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) requests from your web server
or change the [port](https://nextjs.org/docs/api-reference/cli#production) to serve the application directly.

## Installing with Docker

To build the umami container and start up a Postgres database, run:

```bash
docker-compose up
```

Alternatively, to pull just the Umami Docker image with PostgreSQL support:
```bash
docker pull ghcr.io/mikecao/umami:postgresql-latest
```

Or with MySQL support:
```bash
docker pull ghcr.io/mikecao/umami:mysql-latest
```

## Getting updates

To get the latest features, simply do a pull, install any new dependencies, and rebuild:

```bash
git pull
npm install
npm run build
```

To update the Docker image, simply pull the new images and rebuild:

```bash
docker-compose pull
docker-compose up --force-recreate
```

## License

MIT
