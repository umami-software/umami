/* eslint-disable no-console */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prompts = require('prompts');

const prisma = new PrismaClient();

// Function to hash password with bcrypt (replaces imported hashPassword)
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

async function changePassword() {
  console.log('Change user password');
  console.log('-------------------');

  const { username } = await prompts({
    type: 'text',
    name: 'username',
    message: 'Username:',
    initial: 'admin',
  });

  const { password } = await prompts({
    type: 'password',
    name: 'password',
    message: 'New password:',
    validate: value => (value.length >= 8 ? true : 'Password must be at least 8 characters'),
  });

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log(`User not found: ${username}`);
      return;
    }

    const hash = hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash },
    });

    console.log(`Password changed successfully for ${username}.`);
  } catch (e) {
    console.error('Error changing password:', e.message || e);
  } finally {
    await prisma.$disconnect();
  }
}

changePassword();
