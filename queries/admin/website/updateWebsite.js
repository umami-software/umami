import prisma from 'lib/prisma';

export async function updateWebsite(id, data) {
  return prisma.client.website.update({
    where: {
      id,
    },
    data,
  });
}
