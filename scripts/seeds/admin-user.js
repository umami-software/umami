const { hashPassword } = require('next-basics');

/* eslint-disable no-console */
const { client: prismaClient } = require('@umami/prisma-client');

async function seedAdminUser() {
  const adminUserId = process.env.ADMIN_USER_ID;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUserId || !adminUsername || !adminPassword) {
    console.error('Admin credentials are not set.');
    process.exit(1);
  }

  await prismaClient.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      id: adminUserId,
      username: adminUsername,
      password: hashPassword(adminPassword),
      role: 'admin',
    },
  });

  console.log('Admin user seeded successfully.');
}

module.exports = {
  seedAdminUser,
};
