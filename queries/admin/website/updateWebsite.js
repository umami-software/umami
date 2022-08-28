import prisma from 'lib/prisma';

export async function updateWebsite(website_id, data) {
  return prisma.client.website.update({
    where: {
      website_id,
    },
    data,
  });
}
