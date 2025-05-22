/* eslint-disable no-console */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prompts = require('prompts');

const prisma = new PrismaClient();

// Function to hash password with bcrypt (replaces imported hashPassword)
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
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
    const hash = await hashPassword(password);

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
