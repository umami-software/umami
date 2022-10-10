import prisma from 'lib/prisma';

export async function updateAccount(userId, data) {
  return prisma.client.account.update({
    where: {
      id: userId,
    },
    data,
  });
}
