import prisma from 'lib/prisma';

export async function getAccountById(userId) {
  return prisma.client.account.findUnique({
    where: {
      id: userId,
    },
  });
}
