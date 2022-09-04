import prisma from 'lib/prisma';

export async function getAccountByUsername(username) {
  return prisma.client.account.findUnique({
    where: {
      username,
    },
  });
}
