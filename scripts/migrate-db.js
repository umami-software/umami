/* eslint-disable no-console */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');
const { execSync } = require('child_process');
const prompts = require('prompts');

const prisma = new PrismaClient();

function getDatabaseType(url = process.env.DATABASE_URL) {
  const type = process.env.DATABASE_TYPE || (url && url.split(':')[0]);

  if (type === 'postgres') {
    return 'postgresql';
  }

  return type;
}

const databaseType = getDatabaseType();

function success(msg) {
  console.log(chalk.greenBright(`✓ ${msg}`));
}

// function error(msg) {
//   console.log(chalk.redBright(`✗ ${msg}`));
// }

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

async function checkV1Tables(databaseType) {
  const updateV1 =
    await prisma.$queryRaw`select * from _prisma_migrations where migration_name = '04_add_uuid' and finished_at IS NOT NULL`;

  if (updateV1.length > 0) {
    console.log('Preparing v1 tables for migration');

    // alter v1 tables
    if (databaseType === 'postgresql') {
      await dropV1Keys();
    }

    await dropV1Indexes(databaseType);
    await renameV1Tables(databaseType);
  }

  // check for V1 renamed tables
  try {
    await prisma.$queryRaw`select * from v1_account limit 1`;

    success('Database v1 tables ready for migration.');
  } catch (e) {
    throw new Error('Database v1 tables not found.');
  }
}

async function checkV2Tables() {
  try {
    await prisma.$queryRaw`select * from website_event limit 1`;

    success('Database v2 tables found.');
  } catch (e) {
    console.log('Database v2 tables not found.');
    console.log('Adding v2 tables...');

    // run v2 prisma migration steps
    await runSqlFile('../prisma/migrations/01_init/migration.sql');
    console.log(execSync('prisma migrate resolve --applied 01_init').toString());
    console.log(execSync('prisma migrate deploy').toString());
  }
}

async function migrateData() {
  console.log('Starting v2 data migration. Please do no cancel this process, it may take a while.');
  await runSqlFile('../db/postgresql/migration_v2.sql');

  success('Data migration from V1 to V2 tables completed.');
}

async function dropV1Keys() {
  try {
    // drop keys
    await prisma.$transaction([
      prisma.$executeRaw`ALTER TABLE IF EXISTS "_prisma_migrations" DROP CONSTRAINT IF EXISTS "_prisma_migrations_pkey" cascade;`,
      prisma.$executeRaw`ALTER TABLE IF EXISTS "account" DROP CONSTRAINT IF EXISTS "account_pkey" cascade;`,
      prisma.$executeRaw`ALTER TABLE IF EXISTS "event" DROP CONSTRAINT IF EXISTS "event_pkey" cascade;`,
      prisma.$executeRaw`ALTER TABLE IF EXISTS "session" DROP CONSTRAINT IF EXISTS "session_pkey" cascade;`,
      prisma.$executeRaw`ALTER TABLE IF EXISTS "website" DROP CONSTRAINT IF EXISTS "website_pkey" cascade;`,
    ]);

    success('Dropped v1 database keys.');
  } catch (e) {
    console.log(e);
    throw new Error('Failed to drop v1 database keys.');
  }
}

async function renameV1Tables(databaseType) {
  try {
    // rename tables
    if (databaseType === 'postgresql') {
      await prisma.$transaction([
        prisma.$executeRaw`ALTER TABLE IF EXISTS "_prisma_migrations" RENAME TO "v1_prisma_migrations";`,
        prisma.$executeRaw`ALTER TABLE IF EXISTS "account" RENAME TO "v1_account";`,
        prisma.$executeRaw`ALTER TABLE IF EXISTS "event" RENAME TO "v1_event";`,
        prisma.$executeRaw`ALTER TABLE IF EXISTS "event_data" RENAME TO "v1_event_data";`,
        prisma.$executeRaw`ALTER TABLE IF EXISTS "pageview" RENAME TO "v1_pageview";`,
        prisma.$executeRaw`ALTER TABLE IF EXISTS "session" RENAME TO "v1_session";`,
        prisma.$executeRaw`ALTER TABLE IF EXISTS "website" RENAME TO "v1_website";`,
      ]);
    } else {
      await prisma.$transaction([
        prisma.$executeRaw`RENAME TABLE _prisma_migrations TO v1_prisma_migrations;`,
        prisma.$executeRaw`RENAME TABLE account TO v1_account;`,
        prisma.$executeRaw`RENAME TABLE event TO v1_event;`,
        prisma.$executeRaw`RENAME TABLE event_data TO v1_event_data;`,
        prisma.$executeRaw`RENAME TABLE pageview TO v1_pageview;`,
        prisma.$executeRaw`RENAME TABLE session TO v1_session;`,
        prisma.$executeRaw`RENAME TABLE website TO v1_website;`,
      ]);
    }

    success('Renamed v1 database tables.');
  } catch (e) {
    console.log(e);
    throw new Error('Failed to rename v1 database tables.');
  }
}

async function dropV1Indexes(databaseType) {
  try {
    // drop indexes
    if (databaseType === 'postgresql') {
      await prisma.$transaction([
        prisma.$executeRaw`DROP INDEX IF EXISTS "session_session_id_key";`,
        prisma.$executeRaw`DROP INDEX IF EXISTS "session_created_at_idx";`,
        prisma.$executeRaw`DROP INDEX IF EXISTS "session_website_id_idx";`,
        prisma.$executeRaw`DROP INDEX IF EXISTS "website_website_id_key";`,
        prisma.$executeRaw`DROP INDEX IF EXISTS "website_share_id_key";`,
        prisma.$executeRaw`DROP INDEX IF EXISTS "website_created_at_idx";`,
        prisma.$executeRaw`DROP INDEX IF EXISTS "website_share_id_idx";`,
        prisma.$executeRaw`DROP INDEX IF EXISTS "website_user_id_idx";`,
      ]);
    } else {
      await prisma.$transaction([
        prisma.$executeRaw`ALTER TABLE session DROP FOREIGN KEY session_website_id_fkey;`,
        prisma.$executeRaw`DROP INDEX session_created_at_idx ON session;`,
        prisma.$executeRaw`DROP INDEX session_website_id_idx ON session;`,
        prisma.$executeRaw`ALTER TABLE website DROP FOREIGN KEY website_user_id_fkey;`,
        prisma.$executeRaw`DROP INDEX website_user_id_idx ON website;`,
        prisma.$executeRaw`DROP INDEX website_share_id_key ON website;`,
      ]);
    }

    success('Dropped v1 database indexes.');
  } catch (e) {
    console.log(e);
    throw new Error('Failed to drop v1 database indexes.');
  }
}

async function deleteV1TablesPrompt() {
  const response = await prompts({
    type: 'text',
    name: 'value',
    message: 'Do you want to delete V1 database tables? (Y/N)',
    validate: value =>
      value.toUpperCase() !== 'Y' && value.toUpperCase() !== 'N' ? `Please enter Y or N.` : true,
  });

  if (response.value.toUpperCase() == 'Y') {
    await deleteV1Tables();
  }

  success('Migration successfully completed.');
}

async function deleteV1Tables() {
  try {
    // drop tables
    await prisma.$transaction([
      prisma.$executeRaw`DROP TABLE IF EXISTS "v1_prisma_migrations";`,
      prisma.$executeRaw`DROP TABLE IF EXISTS "v1_account";`,
      prisma.$executeRaw`DROP TABLE IF EXISTS "v1_event";`,
      prisma.$executeRaw`DROP TABLE IF EXISTS "v1_event_data";`,
      prisma.$executeRaw`DROP TABLE IF EXISTS "v1_pageview";`,
      prisma.$executeRaw`DROP TABLE IF EXISTS "v1_session";`,
      prisma.$executeRaw`DROP TABLE IF EXISTS "v1_website";`,
    ]);

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
      if (sql.length > 0) {
        await prisma.$executeRawUnsafe(sql);
      }
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
  for (let fn of [
    checkEnv,
    checkConnection,
    checkV1Tables,
    checkV2Tables,
    migrateData,
    deleteV1TablesPrompt,
  ]) {
    try {
      fn.name === 'checkV1Tables' ? await fn(databaseType) : await fn();
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
