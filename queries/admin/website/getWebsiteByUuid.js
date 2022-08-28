import prisma from 'lib/prisma';

export async function getWebsiteByUuid(website_uuid) {
  return prisma.client.website.findUnique({
    where: {
      website_uuid,
    },
  });
}
