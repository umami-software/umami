import prisma from 'lib/prisma';

export async function updateWebsite(data, where) {
  return prisma.client.website.update({
    where,
    data,
  });
}
