/* eslint-disable no-console */
require('dotenv').config();
const { client: prismaClient } = require('@umami/prisma-client');

const { seedAdminUser } = require('./seeds/admin-user');

async function main() {
  // seed admin user
  await seedAdminUser();

  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
