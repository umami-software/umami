/* eslint-disable no-console */
require('dotenv').config();
const { hashPassword } = require('next-basics');
const chalk = require('chalk');
const prompts = require('prompts');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const runQuery = async query => {
  return query.catch(e => {
    throw e;
  });
};

const updateUserByUsername = (username, data) => {
  return runQuery(
    prisma.user.update({
      where: {
        username,
      },
      data,
    }),
  );
};

const changePassword = async (username, newPassword) => {
  const password = hashPassword(newPassword);
  return updateUserByUsername(username, { password });
};

const getUsernameAndPassword = async () => {
  let [username, password] = process.argv.slice(2);
  if (username && password) {
    return { username, password };
  }

  const questions = [];
  if (!username) {
    questions.push({
      type: 'text',
      name: 'username',
      message: 'Enter user to change password',
    });
  }
  if (!password) {
    questions.push(
      {
        type: 'password',
        name: 'password',
        message: 'Enter new password',
      },
      {
        type: 'password',
        name: 'confirmation',
        message: 'Confirm new password',
      },
    );
  }

  const answers = await prompts(questions);
  if (answers.password !== answers.confirmation) {
    throw new Error(`Passwords don't match`);
  }

  return {
    username: username || answers.username,
    password: answers.password,
  };
};

(async () => {
  let username, password;

  try {
    ({ username, password } = await getUsernameAndPassword());
  } catch (error) {
    console.log(chalk.redBright(error.message));
    return;
  }

  try {
    await changePassword(username, password);
    console.log('Password changed for user', chalk.greenBright(username));
  } catch (error) {
    if (error.meta.cause.includes('Record to update not found')) {
      console.log('User not found:', chalk.redBright(username));
    } else {
      throw error;
    }
  }

  prisma.$disconnect();
})();
