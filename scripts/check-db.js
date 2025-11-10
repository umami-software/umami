/* eslint-disable no-console */
import 'dotenv/config';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import semver from 'semver';
// eslint-disable-next-line import/no-unresolved
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const MIN_VERSION = '9.4.0';

if (process.env.SKIP_DB_CHECK) {
  console.log(chalk.yellow('⚠️  Skipping database check (SKIP_DB_CHECK is set).\n'));
  process.exit(0);
}

console.log(chalk.bold.cyan('\n🔍 Checking Database Configuration...\n'));

function success(msg) {
  console.log(chalk.greenBright(`✓ ${msg}`));
}

function error(msg, solution = null, documentation = null) {
  console.log(chalk.redBright(`✗ ${msg}`));
  if (solution) {
    console.log(chalk.yellow(`\n💡 Solution:\n${solution}`));
  }
  if (documentation) {
    console.log(chalk.blue(`\n📖 Documentation: ${documentation}`));
  }
}

async function checkEnv() {
  if (!process.env.DATABASE_URL) {
    const solution = `  1. Create a .env file in the project root
  2. Add DATABASE_URL with your PostgreSQL connection string
  3. Format: postgresql://username:password@host:port/database
  4. Example: postgresql://umami:mypassword@localhost:5432/umami`;

    error('DATABASE_URL is not defined.', solution, 'See .env.example for template');
    throw new Error('DATABASE_URL is not defined.');
  }

  // Validate URL format before proceeding
  try {
    const url = new URL(process.env.DATABASE_URL);
    if (url.protocol !== 'postgresql:') {
      const solution = `  DATABASE_URL must use PostgreSQL protocol
  Format: postgresql://username:password@host:port/database
  Example: postgresql://umami:mypassword@localhost:5432/umami`;

      error('DATABASE_URL must be a PostgreSQL connection string.', solution);
      throw new Error('Invalid DATABASE_URL protocol');
    }
    success('DATABASE_URL is defined and format is valid.');
  } catch (e) {
    if (e.message === 'Invalid DATABASE_URL protocol') {
      throw e;
    }
    const solution = `  DATABASE_URL format is invalid
  Format: postgresql://username:password@host:port/database
  Example: postgresql://umami:mypassword@localhost:5432/umami`;

    error('DATABASE_URL format is invalid.', solution);
    throw new Error('Invalid DATABASE_URL format');
  }
}

async function checkConnection() {
  const url = new URL(process.env.DATABASE_URL);

  const adapter = new PrismaPg(
    { connectionString: url.toString() },
    { schema: url.searchParams.get('schema') },
  );

  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.$connect();
    success('Database connection successful.');
    await prisma.$disconnect();
  } catch (e) {
    const solution = `  Common causes and solutions:
  1. PostgreSQL is not running
     - Start PostgreSQL service
     - Check: pg_ctl status or systemctl status postgresql

  2. Wrong credentials
     - Verify username and password in DATABASE_URL
     - Test connection: psql -U username -d database -h host

  3. Database doesn't exist
     - Create database: createdb umami
     - Or use psql: CREATE DATABASE umami;

  4. Connection refused
     - Check PostgreSQL is listening on the correct port
     - Verify firewall settings
     - Check pg_hba.conf for access permissions`;

    error(`Unable to connect to the database: ${e.message}`, solution);
    throw new Error('Database connection failed');
  }
}

async function checkDatabaseVersion() {
  const url = new URL(process.env.DATABASE_URL);

  const adapter = new PrismaPg(
    { connectionString: url.toString() },
    { schema: url.searchParams.get('schema') },
  );

  const prisma = new PrismaClient({ adapter });

  try {
    const query = await prisma.$queryRaw`select version() as version`;
    const version = semver.valid(semver.coerce(query[0].version));

    if (semver.lt(version, MIN_VERSION)) {
      const solution = `  Your PostgreSQL version (${version}) is below the minimum required (${MIN_VERSION})
  
  Upgrade options:
  1. Using package manager (Ubuntu/Debian):
     sudo apt-get update
     sudo apt-get install postgresql-14

  2. Using package manager (macOS with Homebrew):
     brew upgrade postgresql

  3. Download from official site:
     https://www.postgresql.org/download/`;

      error(
        `Database version ${version} is not compatible. Minimum required: ${MIN_VERSION}`,
        solution,
        'https://www.postgresql.org/download/',
      );
      await prisma.$disconnect();
      throw new Error('Database version incompatible');
    }

    success(`Database version check successful (PostgreSQL ${version}).`);
    await prisma.$disconnect();
  } catch (e) {
    if (e.message === 'Database version incompatible') {
      throw e;
    }
    error(`Unable to check database version: ${e.message}`);
    throw e;
  }
}

async function applyMigration() {
  if (!process.env.SKIP_DB_MIGRATION) {
    try {
      console.log(chalk.cyan('\nApplying database migrations...\n'));
      console.log(execSync('prisma migrate deploy').toString());
      success('Database is up to date.');
    } catch {
      const solution = `  Migration failed. Try these steps:
  1. Ensure database is accessible
  2. Check migration files in prisma/migrations
  3. Reset database if needed: prisma migrate reset
  4. Manually apply migrations: prisma migrate deploy`;

      error('Failed to apply database migrations.', solution);
      throw new Error('Migration failed');
    }
  } else {
    console.log(chalk.yellow('⚠️  Skipping database migrations (SKIP_DB_MIGRATION is set).\n'));
  }
}

(async () => {
  let err = false;
  const checks = [
    { name: 'Environment', fn: checkEnv },
    { name: 'Connection', fn: checkConnection },
    { name: 'Version', fn: checkDatabaseVersion },
    { name: 'Migration', fn: applyMigration },
  ];

  for (const check of checks) {
    try {
      await check.fn();
    } catch {
      err = true;
      break; // Stop on first error
    }
  }

  if (err) {
    console.log(chalk.red.bold('\n❌ Database check failed!\n'));
    console.log(chalk.cyan('Please fix the errors above and try again.\n'));
    process.exit(1);
  } else {
    console.log(chalk.green.bold('\n✅ All database checks passed!\n'));
  }
})();
