import prisma from 'lib/prisma';

export async function getUserWebsites(where) {
  return prisma.client.website.findMany({
    where,
    orderBy: {
      name: 'asc',
    },
  });
}
