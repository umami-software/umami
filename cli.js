#!/usr/bin/env node
'use strict';

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

require('dotenv/config');
var yargs = _interopDefault(require('yargs'));
var chalk = _interopDefault(require('chalk'));
var client = require('@prisma/client');

const prisma = new client.PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.on('query', e => {
  if (process.env.LOG_QUERY) {
    console.log(`${e.query} (${e.duration}ms)`);
  }
});

var createAccount = async () => {
  const account = await prisma.account.findOne({
    where: {
      username: 'admin',
    },
  });

  if (!account) {
    await prisma.account.create({
      data: {
        username: 'admin',
        password: '$2a$10$BXHPV7APlV1I6WrKJt1igeJAyVsvbhMTaTAi3nHkUJFGPsYmfZq3y',
        is_admin: true,
      },
    });
    console.log('Account succesfully created.');
  } else {
    console.log('Account already exists.');
  }
};

const cmd = yargs.usage('Usage: umami <command> [arguments]').help('h').alias('h', 'help');

const { argv } = cmd;
const {
  _: [action, ...params],
} = argv;

const exec = async () => {
  if (action === 'create') {
    await createAccount();
  } else {
    cmd.showHelp();
  }

  console.log(chalk.green('Finished.'));
};

exec().then(() => {
  process.exit(0);
});
