import prisma from 'lib/prisma';

export async function getUsers() {
  return prisma.client.user.findMany({
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
    },
  });
}
