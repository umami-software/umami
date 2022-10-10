import prisma from 'lib/prisma';

export async function getWebsiteByShareId(shareId) {
  return prisma.client.website.findUnique({
    where: {
      shareId,
    },
  });
}
