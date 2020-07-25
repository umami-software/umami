#!/usr/bin/env node

import 'dotenv/config';
import yargs from 'yargs';
import chalk from 'chalk';
import createAccount from './create-account';

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
