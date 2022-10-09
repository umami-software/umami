# umami

Umami is a simple, fast, privacy-focused alternative to Google Analytics.

## Getting started

A detailed getting started guide can be found at [https://umami.is/docs/](https://umami.is/docs/)

## Installing from source

### Requirements

- A server with Node.js version 12 or newer
- A database. Umami supports [MySQL](https://www.mysql.com/) and [Postgresql](https://www.postgresql.org/) databases.

### Install Yarn

```
npm install -g yarn
```

### Get the source code and install packages

```
git clone https://github.com/umami-software/umami.git
cd umami
yarn install
```

### Configure umami

Create an `.env` file with the following

```
DATABASE_URL=connection-url
```

The connection url is in the following format:
```
postgresql://username:mypassword@localhost:5432/mydb

mysql://username:mypassword@localhost:3306/mydb
```

### Build the application

```bash
yarn build
```

### Create database tables

```bash
yarn update-db
```

This will also create a login account with username **admin** and password **umami**.

### Start the application

```bash
yarn start
```

By default this will launch the application on `http://localhost:3000`. You will need to either
[proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) requests from your web server
or change the [port](https://nextjs.org/docs/api-reference/cli#production) to serve the application directly.

## Installing with Docker

To build the umami container and start up a Postgres database, run:

```bash
docker compose up
```

Alternatively, to pull just the Umami Docker image with PostgreSQL support:
```bash
docker pull docker.umami.is/umami-software/umami:postgresql-latest
```

Or with MySQL support:
```bash
docker pull docker.umami.is/umami-software/umami:mysql-latest
```

## Getting updates

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

## Setting up a local development environment for Umami

If you want to run Umami locally for development purposes, you can follow these instructions.

1. Set correct Node version and install dependencies:

```bash
nvm use
npm i
```

2. Run the development Dockerfile which will start PostgreSQL and Adminer (for database administration)

```bash
docker-compose -f docker-compose.development.yml up 
```

3. Create an `.env` file with the following content:

```
DATABASE_URL=postgresql://umami:umami@localhost:54320/umami
```

4. Run:

```bash
ln -s ./db/postgresql prisma
npm run build-db-client
```

This will synlink the schema from `db/postgresql` to `prisma/` and generate your Prisma client.

5. Run migrations

```bash
yarn update-db
```

6. Start the server

```bash
yarn dev
```

You can now visit: http://localhost:3000/

7. Debug database

An Adminer instance is provided, you can reach it at:
http://localhost:8080/

## License

MIT
