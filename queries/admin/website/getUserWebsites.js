import prisma from 'lib/prisma';

export async function getUserWebsites(userId) {
  return prisma.client.website.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
