require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');
const spawn = require('cross-spawn');

let message = '';
const updateMessage = `To update your database, you need to run:\n${chalk.bold.whiteBright(
  'yarn update-db',
)}`;
const baselineMessage = cmd =>
  `You need to update your database by running:\n${chalk.bold.whiteBright(cmd)}`;

function success(msg) {
  console.log(chalk.greenBright(`✓ ${msg}`));
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

async function checkTables() {
  try {
    await prisma.account.findFirst();

    success('Database tables found.');
  } catch (e) {
    message = updateMessage;

    throw new Error('Database tables not found.');
  }
}

async function run(cmd, args) {
  const buffer = [];
  const proc = spawn(cmd, args);

  return new Promise((resolve, reject) => {
    proc.stdout.on('data', data => buffer.push(data));

    proc.on('error', () => {
      reject(new Error('Failed to run Prisma.'));
    });

    proc.on('exit', () => resolve(buffer.join('')));
  });
}

async function checkMigrations() {
  const output = await run('prisma', ['migrate', 'status']);

  const missingMigrations = output.includes('Following migration have not yet been applied');
  const notManaged = output.includes('The current database is not managed');

  if (notManaged) {
    const cmd = output.match(/yarn prisma migrate resolve --applied ".*"/g);

    message = baselineMessage(cmd[0]);

    throw new Error('Database is out of date.');
  } else if (missingMigrations) {
    message = updateMessage;

    throw new Error('Database is out of date.');
  }

  success('Database is up to date.');
}

(async () => {
  let err = false;
  for (let fn of [checkEnv, checkConnection, checkTables, checkMigrations]) {
    try {
      await fn();
    } catch (e) {
      console.log(chalk.red(`✗ ${e.message}`));
      err = true;
    } finally {
      await prisma.$disconnect();
      if (err) {
        console.log(message);
        process.exit(1);
      }
    }
  }
})();
