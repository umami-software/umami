/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');
const { execSync } = require('child_process');
const prompts = require('prompts');

const prisma = new PrismaClient();

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
    throw new Error('Unable to connect to the database.');
  }
}

async function checkV1Tables() {
  try {
    await prisma.$queryRaw`select * from account limit 1`;

    success('Database v1 tables found.');
    console.log('Preparing v1 tables for migration');

    // alter v1 tables
    await dropV1Keys();
    await renameV1Tables();
    await dropV1Indexes();
  } catch (e) {
    error('Database v1 tables not found.');
  }
}

async function checkV2Tables() {
  try {
    await prisma.$queryRaw`select * from website_event limit 1`;

    success('Database v2 tables found.');
  } catch (e) {
    error('Database v2 tables not found.');
    console.log('Adding v2 tables...');

    // run v2 prisma migration steps
    await runSqlFile('../prisma/migrations/01_init/migration.sql');
    console.log(execSync('prisma migrate resolve --applied 01_init').toString());
    console.log(execSync('prisma migrate deploy').toString());
    console.log(
      'Starting v2 data migration. Please do no cancel this process, it may take a while.',
    );
    await runSqlFile('../db/postgresql/migration_v2.sql');
  }
}

async function dropV1Keys() {
  try {
    // drop keys
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "_prisma_migrations" DROP CONSTRAINT IF EXISTS "_prisma_migrations_pkey" cascade;`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "account" DROP CONSTRAINT IF EXISTS "account_pkey" cascade;`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "event" DROP CONSTRAINT IF EXISTS "event_pkey" cascade;`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "session" DROP CONSTRAINT IF EXISTS "session_pkey" cascade;`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "website" DROP CONSTRAINT IF EXISTS "website_pkey" cascade;`;

    success('Dropped v1 database keys.');
  } catch (e) {
    throw new Error('Failed to drop v1 database keys.');
  }
}

async function renameV1Tables() {
  try {
    // rename tables
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "_prisma_migrations" RENAME TO "v1_prisma_migrations";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "account" RENAME TO "v1_account";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "event" RENAME TO "v1_event";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "event_data" RENAME TO "v1_event_data";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "pageview" RENAME TO "v1_pageview";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "session" RENAME TO "v1_session";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "website" RENAME TO "v1_website";`;

    success('Renamed v1 database tables.');
  } catch (e) {
    throw new Error('Failed to rename v1 database tables.');
  }
}

async function dropV1Indexes() {
  try {
    // drop indexes
    await prisma.$executeRaw`DROP INDEX IF EXISTS "user_user_id_key";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "user_username_key";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "session_session_id_key";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "session_created_at_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "session_website_id_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "website_website_id_key";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "website_share_id_key";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "website_created_at_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "website_share_id_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "website_user_id_idx";`;

    success('Dropped v1 database indexes.');
  } catch (e) {
    throw new Error('Failed to drop v1 database indexes.');
  }
}

async function deleteV1TablesPrompt() {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: 'Do you want to delete V1 database tables? (Y/N)',
    validate: value => (value !== 'Y' && value !== 'N' ? `Please enter Y or N.` : true),
  });

  if (response.value === 'Y') {
    await deleteV1Tables();
  }
}

async function deleteV1Tables() {
  try {
    // drop tables
    await prisma.$executeRaw`DROP TABLE IF EXISTS "v1_prisma_migrations";`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "v1_account";`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "v1_event";`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "v1_event_data";`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "v1_pageview";`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "v1_session";`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "v1_website";`;

    success('Dropped v1 database tables.');
  } catch (e) {
    throw new Error('Failed to drop v1 database tables.');
  }
}

async function runSqlFile(filePath) {
  try {
    const rawSql = await fs.promises.readFile(path.join(__dirname, filePath));

    const sqlStatements = rawSql
      .toString()
      .split('\n')
      .filter(line => !line.startsWith('--')) // remove comments-only lines
      .join('\n')
      .replace(/\r\n|\n|\r/g, ' ') // remove newlines
      .replace(/\s+/g, ' ') // excess white space
      .split(';');

    for (const sql of sqlStatements) {
      await prisma.$executeRawUnsafe(sql);
    }
    filePath;

    success(`Ran sql file ${filePath}.`);
  } catch (e) {
    console.log(e);
    throw new Error(`Failed to run sql file ${filePath}.`);
  }
}

(async () => {
  let err = false;
  for (let fn of [checkEnv, checkConnection, checkV1Tables, checkV2Tables, deleteV1TablesPrompt]) {
    try {
      await fn();
    } catch (e) {
      console.log(chalk.red(`✗ ${e.message}`));
      err = true;
    } finally {
      await prisma.$disconnect();
      if (err) {
        process.exit(1);
      }
    }
  }
})();
