import prisma from 'lib/prisma';

export async function getUserWebsites(user_id) {
  return prisma.client.website.findMany({
    where: {
      user_id,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
