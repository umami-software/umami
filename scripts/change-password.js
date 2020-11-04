require('dotenv').config();
const bcrypt = require('bcrypt');
const chalk = require('chalk');
const prompts = require('prompts');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

const runQuery = async query => {
  return query.catch(e => {
    throw e;
  });
};

const updateAccountByUsername = (username, data) => {
  return runQuery(
    prisma.account.update({
      where: {
        username,
      },
      data,
    }),
  );
};

const hashPassword = password => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const changePassword = async (username, newPassword) => {
  const password = await hashPassword(newPassword);
  return updateAccountByUsername(username, { password });
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
      message: 'Enter account to change password',
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
    if (error.message.includes('RecordNotFound')) {
      console.log('Account not found:', chalk.redBright(username));
    } else {
      throw error;
    }
  }

  prisma.$disconnect();
})();
