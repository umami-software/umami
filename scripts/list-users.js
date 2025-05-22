/* eslint-disable no-console */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Function to hash password with bcrypt
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

async function createAdmin() {
  const username = 'admin';
  const password = 'umami';

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      console.log(`User ${username} already exists.`);
      return;
    }

    // Create new admin user
    const hash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        username,
        password: hash,
        role: 'admin',
      },
    });

    console.log(`Admin user created successfully with ID: ${user.id}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
  } catch (e) {
    console.error('Error creating admin user:', e);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
