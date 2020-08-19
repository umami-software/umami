# umami

## Installation

### Get the source code

```
git clone https://github.com/mikecao/umami.git
```

### Go into the repo folder

```
cd umami
```

### Install packages

```
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

### Generate database client

Depending on your database type, run the appropriate script.

For MySQL:

```
npm run build-mysql-client
```

For Postgresql:

```
npm run build-postgresql-client
```

### Create a production build

```
npm run build
```

### Start the application

```
npm start
```

By default this will launch the application on `http://localhost:3000`. You will need to either 
[proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) requests from your web server
or change the [port](https://nextjs.org/docs/api-reference/cli#production) to serve the application directly.

### Start the application with pm2 and custom port

Add the custom port (here '-p 3010') at the start script:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start -p 3010",
  "build-tracker": "rollup -c rollup.tracker.config.js",
  "build-mysql-schema": "dotenv prisma introspect -- --schema=./prisma/schema.mysql.prisma",
  "build-mysql-client": "dotenv prisma generate -- --schema=./prisma/schema.mysql.prisma",
  "build-postgresql-schema": "dotenv prisma introspect -- --schema=./prisma/schema.postgresql.prisma",
  "build-postgresql-client": "dotenv prisma generate -- --schema=./prisma/schema.postgresql.prisma"
},
```

Start the application with pm2:

```
pm2 start npm --name "unami" -- start
```

## License

MIT
