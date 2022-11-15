import { Prisma, Website } from '@prisma/client';
import prisma from 'lib/prisma';

export async function updateWebsite(websiteId, data: Prisma.WebsiteUpdateInput): Promise<Website> {
  return prisma.client.website.update({
    where: {
      id: websiteId,
    },
    data,
  });
}
