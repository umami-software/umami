import prisma from 'lib/prisma';

export async function getWebsite(where) {
  return prisma.client.website.findUnique({
    where,
  });
}
