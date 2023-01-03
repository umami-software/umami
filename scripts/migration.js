/* eslint-disable no-console */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');
// const spawn = require('cross-spawn');
// const { execSync } = require('child_process');

const prisma = new PrismaClient();

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

async function checkTables() {
  try {
    await prisma.$queryRaw`select * from user limit 1`;

    success('Database tables found.');
  } catch (e) {
    throw new Error('Database tables not found.');
  }
}

async function dropKeys() {
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

async function renameTables() {
  try {
    // rename tables
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "_prisma_migrations" RENAME TO "_prisma_migrations_v1";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "account" RENAME TO "account_v1";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "event" RENAME TO "event_v1";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "event_data" RENAME TO "event_data_v1";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "pageview" RENAME TO "pageview_v1";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "session" RENAME TO "session_v1";`;
    await prisma.$executeRaw`ALTER TABLE IF EXISTS "website" RENAME TO "website_v1";`;

    success('Renamed v1 database tables.');
  } catch (e) {
    throw new Error('Failed to rename v1 database tables.');
  }
}

async function dropIndexes() {
  try {
    // drop indexes
    await prisma.$executeRaw`DROP INDEX IF EXISTS "account_account_uuid_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "event_created_at_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "event_event_uuid_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "event_session_id_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "event_website_id_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "pageview_created_at_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "pageview_session_id_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "pageview_website_id_created_at_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "pageview_website_id_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "pageview_website_id_session_id_created_at_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "session_created_at_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "session_session_uuid_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "session_website_id_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "website_user_id_idx";`;
    await prisma.$executeRaw`DROP INDEX IF EXISTS "website_website_uuid_idx";`;

    success('Dropped v1 database indexes.');
  } catch (e) {
    throw new Error('Failed to drop v1 database indexes.');
  }
}

// async function checkNewTables() {
//     try {
//       await prisma.$queryRaw`select * from website_event limit 1`;

//       success('Database v2 tables found.');
//     } catch (e) {
//       throw new Error('Database v2 tables not found.');
//     }
//   }

(async () => {
  let err = false;
  for (let fn of [checkEnv, checkConnection, checkTables, dropKeys, renameTables, dropIndexes]) {
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
