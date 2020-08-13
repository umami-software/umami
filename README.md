# umami

## Getting started

### Install umami

```
git clone https://github.com/mikecao/umami.git
```

### Go into your repo folder

```
cd umami
```

### Create database tables

Umami supports MySQL and Postgresql. Create a database for your Umami
installation and install the tables with the included scripts.

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

### Start the development server

```
npm run develop
```

### Create a production build

```
npm run build
```