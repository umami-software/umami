const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async () => {
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
