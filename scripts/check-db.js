/* eslint-disable no-console */
import 'dotenv/config';
import { execSync } from 'node:child_process';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import chalk from 'chalk';
import { v4 as uuid } from 'uuid';
import semver from 'semver';
import { PrismaClient } from '../generated/prisma/client.js';

const MIN_VERSION = '9.4.0';

if (process.env.SKIP_DB_CHECK) {
  console.log('Skipping database check.');
  process.exit(0);
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

  if (process.env.REDIS_URL) {
    success('REDIS_URL is defined.');
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

  if (semver.lt(version, MIN_VERSION)) {
    throw new Error(
      `Database version is not compatible. Please upgrade to ${MIN_VERSION} or greater.`,
    );
  }

  success('Database version check successful.');
}

async function applyMigration() {
  if (!process.env.SKIP_DB_MIGRATION) {
    console.log(execSync('prisma migrate deploy').toString());

    success('Database is up to date.');
  }
}

async function createDefaultUser() {
  const existing = await prisma.user.findFirst({ where: { role: 'admin' } });

  if (!existing) {
    const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'umami';

    await prisma.user.create({
      data: { id: uuid(), username, password: bcrypt.hashSync(password, 10), role: 'admin' },
    });

    success(`Admin user created (${username}).`);
  }
}

(async () => {
  let err = false;
  for (const fn of [checkEnv, checkConnection, checkDatabaseVersion, applyMigration, createDefaultUser]) {
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
