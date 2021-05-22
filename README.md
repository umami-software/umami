# 🧭 umami-sqlite
Modded version of [Umami Analytics](https://umami.is) backed by a local SQLite database
> simple, fast, open source website analytics

## Quick Start
### Requirements
- Node.js >= 14.17.0

### Install Dependencies

```
yarn
```

### (seemingly optional?) Run db migration
```
yarn prisma migrate dev
```

### Configure env

Create an `.env` file with the following

```
HASH_SALT=anyrandomstring
```

### Build the application

```bash
yarn build
```

### Start the application

```bash
yarn start
```

The application will be available on `http://localhost:3000`.