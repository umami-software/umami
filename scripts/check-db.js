/* eslint-disable no-console */
import 'dotenv/config';

import { execSync } from 'node:child_process';
import chalk from 'chalk';
import semver from 'semver';
import { PrismaClient } from '../dist/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

if (process.env.SKIP_DB_CHECK) {
  console.log('Skipping database check.');
  process.exit(0);
}

function getDatabaseType(url = process.env.DATABASE_URL) {
  const type = url && url.split(':')[0];

  if (type === 'postgres') {
    return 'postgresql';
  }

  return type;
}

const url = new URL(process.env.DATABASE_URL);

const adapter = new PrismaPg(
  { connectionString: url.toString() },
  { schema: url.searchParams.get('schema') },
);

const prisma = new PrismaClient({ adapter });

function success(msg) {
  console.log(chalk.greenBright(`✓ ${msg}`));
}

function error(msg) {
  console.log(chalk.redBright(`✗ ${msg}`));
}

async function checkEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined.');
  } else {
    success('DATABASE_URL is defined.');
  }
}

async function checkConnection() {
  try {
    await prisma.$connect();

    success('Database connection successful.');
  } catch (e) {
    throw new Error('Unable to connect to the database: ' + e.message);
  }
}

async function checkDatabaseVersion() {
  const query = await prisma.$queryRaw`select version() as version`;
  const version = semver.valid(semver.coerce(query[0].version));

  const databaseType = getDatabaseType();
  const minVersion = databaseType === 'postgresql' ? '9.4.0' : '5.7.0';

  if (semver.lt(version, minVersion)) {
    throw new Error(
      `Database version is not compatible. Please upgrade ${databaseType} version to ${minVersion} or greater`,
    );
  }

  success('Database version check successful.');
}

async function checkV1Tables() {
  try {
    // check for v1 migrations before v2 release date
    const record =
      await prisma.$queryRaw`select * from _prisma_migrations where started_at < '2023-04-17'`;

    if (record.length > 0) {
      error(
        'Umami v1 tables detected. For how to upgrade from v1 to v2 go to https://umami.is/docs/migrate-v1-v2.',
      );
      process.exit(1);
    }
  } catch {
    // Ignore
  }
}

async function applyMigration() {
  if (!process.env.SKIP_DB_MIGRATION) {
    console.log(execSync('prisma migrate deploy').toString());

    success('Database is up to date.');
  }
}

(async () => {
  let err = false;
  for (const fn of [
    checkEnv,
    checkConnection,
    checkDatabaseVersion,
    checkV1Tables,
    applyMigration,
  ]) {
    try {
      await fn();
    } catch (e) {
      error(e.message);
      err = true;
    } finally {
      if (err) {
        process.exit(1);
      }
    }
  }
})();
