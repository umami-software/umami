import prisma from 'lib/prisma';

export async function getAccounts() {
  return prisma.client.account.findMany({
    orderBy: [
      { isAdmin: 'desc' },
      {
        username: 'asc',
      },
    ],
    select: {
      id: true,
      username: true,
      isAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
