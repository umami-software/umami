#!/usr/bin/env node

require('dotenv').config();
const yargs = require('yargs');
const chalk = require('chalk');
const createAccount = require('./create-account');

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

  process.exit(0);
};

exec();
