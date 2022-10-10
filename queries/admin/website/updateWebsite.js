import prisma from 'lib/prisma';

export async function updateWebsite(websiteId, data) {
  return prisma.client.website.update({
    where: {
      id: websiteId,
    },
    data,
  });
}
