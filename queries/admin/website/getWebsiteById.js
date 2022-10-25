import prisma from 'lib/prisma';

export async function getWebsiteById(websiteId) {
  return prisma.client.website.findUnique({
    where: {
      id: websiteId,
    },
  });
}
