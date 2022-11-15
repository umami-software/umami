import { Website } from '@prisma/client';
import cache from 'lib/cache';
import prisma from 'lib/prisma';

export async function createWebsite(
  userId: string,
  data: {
    id: string;
    name: string;
    domain: string;
    shareId?: string;
  },
): Promise<Website> {
  return prisma.client.website
    .create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        ...data,
      },
    })
    .then(async data => {
      if (cache.enabled) {
        await cache.storeWebsite(data);
      }

      return data;
    });
}
