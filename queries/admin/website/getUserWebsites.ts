import prisma from 'lib/prisma';
import { Website } from '@prisma/client';

export async function getUserWebsites(userId): Promise<Website[]> {
  return prisma.client.website.findMany({
    where: {
      userId,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
