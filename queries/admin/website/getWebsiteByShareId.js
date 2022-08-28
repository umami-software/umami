import prisma from 'lib/prisma';

export async function getWebsiteByShareId(share_id) {
  return prisma.client.website.findUnique({
    where: {
      share_id,
    },
  });
}
