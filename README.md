# umami-sqlite
Modded version of [Umami Analytics](https://umami.is) backed by a local SQLite database

Umami is a simple, fast, website analytics alternative to Google Analytics.

## Getting started
- Node.js >= 14.17.0

### Install Dependencies

```
yarn
```

### Run db migration
```
yarn prisma migrate dev
```

### Configure umami

Create an `.env` file with the following

```
HASH_SALT=(any random string)
```

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