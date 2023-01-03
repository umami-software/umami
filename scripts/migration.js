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
    await prisma.$queryRaw`select * from account limit 1`;

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

async function dropIndexes() {
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

    success('Dropped v1 database indexes.');
  } catch (e) {
    throw new Error('Failed to drop v1 database indexes.');
  }
}

async function createPrismaTable() {
  try {
    // drop / recreate _prisma_migrations table
    await prisma.$executeRaw`DROP TABLE IF EXISTS "_prisma_migrations";`;
    await prisma.$executeRaw`CREATE TABLE "_prisma_migrations"
    (
        id                  varchar(36)                            not null
            constraint "_prisma_migrations_pkey"
                primary key,
        "checksum"            varchar(64)                            not null,
        "finished_at"         timestamp with time zone,
        "migration_name"      varchar(255)                           not null,
        "logs"                text,
        "rolled_back_at"      timestamp with time zone,
        "started_at"          timestamp with time zone default now() not null,
        "applied_steps_count" integer                  default 0     not null
    );`;

    success('Created Prisma migrations table.');
  } catch (e) {
    throw new Error('Failed to create Prisma migrations table.');
  }
}

// async function prismaMigrate() {
//   try {

//     success('Created Prisma migrations table.');
//   } catch (e) {
//     throw new Error('Failed to create Prisma migrations table.');
//   }
// }

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
  for (let fn of [
    checkEnv,
    checkConnection,
    checkTables,
    dropKeys,
    renameTables,
    dropIndexes,
    createPrismaTable,
  ]) {
    // for (let fn of [checkEnv, checkConnection, createPrismaTable]) {
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
